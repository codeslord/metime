import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { getAiClient, retryWithBackoff } from '../aiUtils';
import { imageGenerationLimiter, dissectionLimiter, trackApiUsage } from '../../utils/rateLimiter';
import { BriaService } from '../briaService';
import { BriaGenerationResult } from '../briaTypes';
import { PromptEngineeringService } from '../promptEngineering';
import { CraftCategory, DissectionResponse } from '../../types';
import { Type } from "@google/genai";

/**
 * Abstract base class for category-specific agents.
 * Each category agent handles all intents for a specific craft category.
 */
export abstract class CategoryAgentBase extends AgentBase {
    /**
     * The craft category this agent handles.
     */
    abstract readonly category: CraftCategory;

    /**
     * Get the agent card with category-specific capabilities.
     */
    abstract readonly card: AgentCard;

    /**
     * Category-specific prompt for master image generation.
     */
    protected abstract getMasterImagePrompt(userPrompt: string): string;

    /**
     * Category-specific prompt for step image generation.
     */
    protected abstract getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string;

    /**
     * Category-specific prompt for dissection.
     */
    protected abstract getDissectionPrompt(userPrompt: string): string;

    /**
     * Category-specific prompt for pattern sheet generation.
     */
    protected abstract getPatternSheetPrompt(craftLabel?: string): string;

    /**
     * Process incoming task messages and route to appropriate handler.
     */
    async processTask(task: A2AMessage): Promise<A2AMessage> {
        const { intent } = task.payload;

        try {
            let result;
            switch (intent) {
                case 'generate_master_image':
                    result = await this.generateMasterImage(task.payload.prompt);
                    break;
                case 'generate_craft_from_image':
                    result = await this.generateCraftFromImage(task.payload.imageBase64);
                    break;
                case 'generate_step_image':
                    // PARALLEL CONSTRUCTION: All steps reference master directly
                    result = await this.generateStepImage(
                        task.payload.masterSeed,
                        task.payload.stepDescription,
                        task.payload.masterStructuredPrompt,
                        task.payload.stepNumber,
                        task.payload.totalSteps
                        // NO previousStepPrompt - parallel generation
                    );
                    break;
                case 'dissect_craft':
                    result = await this.dissectCraft(task.payload.imageBase64, task.payload.userPrompt);
                    break;
                case 'generate_pattern_sheet':
                    result = await this.generatePatternSheet(
                        task.payload.originalImageBase64,
                        task.payload.craftLabel
                    );
                    break;
                default:
                    throw new Error(`Unknown intent for ${this.category} agent: ${intent}`);
            }
            return this.createResponse(task, { result });
        } catch (error: any) {
            return this.createErrorResponse(task, error.message || `Unknown error in ${this.category} agent`);
        }
    }

    // --- Shared Implementation Methods ---

    /**
     * Generate master image for refinement.
     */
    protected async generateMasterImage(prompt: string): Promise<{ imageUrl: string; structuredPrompt: any; seed: number }> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s.`);
        }

        try {
            trackApiUsage('generateMasterImage', true);

            // 1. Generate Structured Prompt using Gemini (VLM Bridge)
            const structuredPrompt = await PromptEngineeringService.createMasterPrompt(prompt, this.category);

            // 2. Generate Image with Bria - returns full result including seed
            const result = await BriaService.generateImage('', undefined, structuredPrompt);

            return {
                imageUrl: result.imageUrl,
                structuredPrompt: result.structuredPrompt,
                seed: result.seed
            };
        } catch (error) {
            trackApiUsage('generateMasterImage', false);
            throw error;
        }
    }

    protected async generateCraftFromImage(imageBase64: string): Promise<{ imageUrl: string; structuredPrompt: any; seed: number }> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s.`);
        }

        const prompt = this.getMasterImagePrompt('Transform this into a craft reference');

        try {
            trackApiUsage('generateCraftFromImage', true);

            // Ensure image has proper base64 format with data URI prefix
            let formattedImage = imageBase64;
            if (!imageBase64.startsWith('data:')) {
                // If it's raw base64, add the data URI prefix
                // Default to JPEG, but could be PNG
                formattedImage = `data:image/jpeg;base64,${imageBase64}`;
                console.log('Added data URI prefix to image');
            }

            console.log('Formatted image (first 100 chars):', formattedImage.substring(0, 100));

            const result = await BriaService.generateImage(prompt, [formattedImage]);
            return {
                imageUrl: result.imageUrl,
                structuredPrompt: result.structuredPrompt,
                seed: result.seed
            };
        } catch (error) {
            trackApiUsage('generateCraftFromImage', false);
            throw error;
        }
    }

    /**
     * Generate step image using PARALLEL CONSTRUCTION.
     * 
     * ALL STEPS now use VLM refinement with the master image as reference.
     * Each step independently shows a percentage of progress toward the master.
     * This enables parallel generation of all steps.
     * 
     * @param masterSeed Seed from master image (MUST be same for all steps)
     * @param stepDescription Description of what this step should show
     * @param masterStructuredPrompt Master image's structured JSON (THE GOAL)
     * @param stepNumber Current step (1-indexed)
     * @param totalSteps Total number of steps
     */
    protected async generateStepImage(
        masterSeed: number,
        stepDescription: string,
        masterStructuredPrompt: any,
        stepNumber: number,
        totalSteps: number
    ): Promise<{ imageUrl: string; structuredPrompt: any; seed: number }> {
        try {
            const completionPercent = Math.round((stepNumber / totalSteps) * 100);

            console.log(`\n🔧 Parallel Step Generation - Step ${stepNumber}/${totalSteps} (~${completionPercent}%)`);
            console.log(`   Step Description: "${stepDescription}"`);
            console.log(`   Master Seed: ${masterSeed} (same for consistency)`);
            console.log(`   Using VLM refinement with master as reference`);

            // ALL STEPS: Use VLM refinement with master as the goal
            // No previousStepPrompt needed - each step is independent
            const stepStructuredPrompt = await PromptEngineeringService.refineStructuredPrompt(
                masterStructuredPrompt,
                stepDescription,
                stepNumber,
                totalSteps,
                this.category
                // NO previousStepPrompt - parallel generation
            );

            console.log(`   ✅ Generated specific JSON for step ${stepNumber}`);

            // Generate image using the MODIFIED JSON and SAME SEED
            // This ensures strict visual consistency (same seed/lighting/style) 
            // but with the specific progress level for this step.
            const result = await BriaService.generateImage(
                '',
                undefined,
                stepStructuredPrompt,
                masterSeed
            );

            console.log(`✅ Step ${stepNumber}/${totalSteps} generated successfully with JSON control`);

            return {
                imageUrl: result.imageUrl,
                structuredPrompt: result.structuredPrompt,
                seed: masterSeed
            };

        } catch (error) {
            console.error(`Step image generation error for step ${stepNumber}:`, error);
            throw new Error(`Failed to generate step ${stepNumber} image`);
        }
    }

    protected async dissectCraft(imageBase64: string, userPrompt: string): Promise<DissectionResponse> {
        if (!dissectionLimiter.canMakeRequest()) {
            const waitTime = dissectionLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded.Wait ${Math.ceil(waitTime / 1000)} s.`);
        }

        const ai = getAiClient();

        let cleanBase64 = imageBase64;

        // Check if input is a URL (Bria Output) and fetch it to get Base64
        if (imageBase64.startsWith('http')) {
            try {
                const imageResp = await fetch(imageBase64);
                if (!imageResp.ok) throw new Error('Failed to fetch image from URL');
                const buffer = await imageResp.arrayBuffer();
                // Convert ArrayBuffer to Base64 string
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                cleanBase64 = btoa(binary);
            } catch (e) {
                console.error('Error fetching image for dissection:', e);
                throw new Error('Failed to download generated image for analysis');
            }
        } else {
            cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        }

        const prompt = this.getDissectionPrompt(userPrompt);

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ inlineData: { mimeType: 'image/png', data: cleanBase64 } }, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            complexity: { type: Type.STRING, enum: ["Simple", "Moderate", "Complex"] },
                            complexityScore: { type: Type.NUMBER },
                            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                            steps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        stepNumber: { type: Type.NUMBER },
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        safetyWarning: { type: Type.STRING, nullable: true },
                                    },
                                    required: ["stepNumber", "title", "description"],
                                },
                            },
                        },
                        required: ["complexity", "complexityScore", "materials", "steps"],
                    },
                },
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from dissection");
            trackApiUsage('dissectCraft', true);
            return JSON.parse(text) as DissectionResponse;
        }).catch(e => {
            trackApiUsage('dissectCraft', false);
            throw e;
        });
    }

    protected async generatePatternSheet(originalImageBase64: string, craftLabel?: string): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            throw new Error(`Rate limit exceeded.`);
        }

        const prompt = this.getPatternSheetPrompt(craftLabel);

        try {
            trackApiUsage('generatePatternSheet', true);
            const result = await BriaService.generateImage(prompt, [originalImageBase64]);
            return result.imageUrl;
        } catch (error) {
            trackApiUsage('generatePatternSheet', false);
            throw error;
        }
    }

    /**
     * Helper to create standard capabilities for category agents.
     */
    protected static createCategoryCapabilities(category: CraftCategory) {
        return [
            {
                intent: 'generate_master_image',
                description: `Generate a master reference image for ${category} crafts.`,
                inputSchema: { prompt: 'string', category: 'CraftCategory' }
            },
            {
                intent: 'generate_craft_from_image',
                description: `Transform an uploaded image into a ${category} craft reference.`,
                inputSchema: { imageBase64: 'string', category: 'CraftCategory' }
            },
            {
                intent: 'generate_step_image',
                description: `Generate a step visualization for ${category} crafts.`,
                inputSchema: { originalImageBase64: 'string', stepDescription: 'string', category: 'CraftCategory', targetObjectLabel: 'string', stepNumber: 'number' }
            },
            {
                intent: 'dissect_craft',
                description: `Analyze and dissect a ${category} craft into steps.`,
                inputSchema: { imageBase64: 'string', userPrompt: 'string' }
            },
            {
                intent: 'generate_pattern_sheet',
                description: `Generate a pattern sheet for ${category} crafts.`,
                inputSchema: { originalImageBase64: 'string', category: 'CraftCategory', craftLabel: 'string' }
            }
        ];
    }
}
