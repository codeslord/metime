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
                    // FIBO Refine mode: uses master's structured JSON + refinement prompt + seed
                    result = await this.generateStepImage(
                        task.payload.masterSeed,
                        task.payload.stepDescription,
                        task.payload.masterStructuredPrompt,
                        task.payload.stepNumber,
                        task.payload.totalSteps
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
            const result = await BriaService.generateImage(prompt, [imageBase64]);
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
     * Generate step image using FIBO's Refine mode.
     * 
     * FIBO REFINE MODE (from Bria docs):
     * 1. Pass master's structured_prompt (full JSON)
     * 2. Add short text prompt describing the refinement (e.g., "show materials laid out")
     * 3. Use same seed for compositional consistency
     * 4. Bria modifies ONLY the aspects mentioned in the text prompt
     * 
     * This ensures visual consistency while allowing progressive construction.
     * 
     * @param masterSeed Seed from master image (MUST be same for all steps)
     * @param stepDescription Description of what this step should show
     * @param masterStructuredPrompt Master image's structured JSON
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

            console.log(`\n🔧 FIBO Refine Mode - Step ${stepNumber}/${totalSteps} (~${completionPercent}%)`);
            console.log(`   Step Description: "${stepDescription}"`);
            console.log(`   Master Seed: ${masterSeed} (same for consistency)`);

            // FINAL STEP: Use master's exact structured prompt for 100% match
            if (stepNumber === totalSteps) {
                console.log(`   🎯 Final step: Using master's exact structured prompt`);
                console.log(`   Prompt Type: ${typeof masterStructuredPrompt}`);
                if (typeof masterStructuredPrompt === 'string') {
                    console.log(`   Prompt Length: ${masterStructuredPrompt.length}`);
                }

                const result = await BriaService.generateImage(
                    '',
                    undefined,
                    masterStructuredPrompt,
                    masterSeed
                );

                return {
                    imageUrl: result.imageUrl,
                    structuredPrompt: result.structuredPrompt,
                    seed: masterSeed
                };
            }

            // STEPS 1-4: Use FIBO Refine Mode
            // Create a short refinement instruction based on step description and completion
            const refinementInstruction = this.createRefinementInstruction(
                stepDescription,
                completionPercent,
                stepNumber,
                totalSteps
            );

            console.log(`   Refinement Instruction: "${refinementInstruction}"`);

            // Use Bria's refineImage method which passes:
            // - structured_prompt: master's full JSON
            // - prompt: short refinement instruction  
            // - seed: same seed as master
            const result = await BriaService.refineImage(
                masterStructuredPrompt,
                masterSeed,
                refinementInstruction
            );

            console.log(`✅ Step ${stepNumber}/${totalSteps} refined successfully`);

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

    /**
     * Creates a short refinement instruction for FIBO's Refine mode.
     * Includes human hands performing the action and preserves background/base materials.
     */
    protected createRefinementInstruction(
        stepDescription: string,
        completionPercent: number,
        stepNumber: number,
        totalSteps: number
    ): string {
        // Get category-specific hand action and preservation context
        const handAction = this.getHandActionForCategory(completionPercent);
        const preservationContext = this.getPreservationContext();

        // Create progressive instruction based on completion percentage
        let progressDescriptor = "";

        if (completionPercent <= 20) {
            progressDescriptor = `show ${handAction} beginning the craft, with raw materials in early stage`;
        } else if (completionPercent <= 40) {
            progressDescriptor = `show ${handAction} working on the craft, partially assembled`;
        } else if (completionPercent <= 60) {
            progressDescriptor = `show ${handAction} continuing the craft, halfway completed`;
        } else if (completionPercent <= 80) {
            progressDescriptor = `show ${handAction} finishing touches, craft nearly complete`;
        } else {
            progressDescriptor = `show ${handAction} final details, craft almost identical to finished version`;
        }

        // Combine: step description + progress + hands + preservation
        return `${stepDescription}. ${progressDescriptor}. ${preservationContext}`;
    }

    /**
     * Get category-specific hand action descriptions
     */
    protected getHandActionForCategory(completionPercent: number): string {
        switch (this.category) {
            case CraftCategory.PAPERCRAFT:
                if (completionPercent <= 20) return "human hands folding paper";
                if (completionPercent <= 40) return "human hands creasing and shaping paper";
                if (completionPercent <= 60) return "human hands assembling paper pieces";
                return "human hands adding final paper details";

            case CraftCategory.CLAY:
                if (completionPercent <= 20) return "human hands molding clay";
                if (completionPercent <= 40) return "human hands shaping clay form";
                if (completionPercent <= 60) return "human hands sculpting clay details";
                return "human hands smoothing clay surface";

            case CraftCategory.WOODCRAFT:
                if (completionPercent <= 20) return "human hands marking wood";
                if (completionPercent <= 40) return "human hands cutting wood pieces";
                if (completionPercent <= 60) return "human hands assembling wood parts";
                return "human hands sanding and finishing wood";

            case CraftCategory.JEWELRY:
                if (completionPercent <= 20) return "human hands arranging beads/components";
                if (completionPercent <= 40) return "human hands threading/connecting pieces";
                if (completionPercent <= 60) return "human hands assembling jewelry";
                return "human hands adjusting final jewelry details";

            case CraftCategory.KIDS_CRAFTS:
                if (completionPercent <= 20) return "child's hands gathering materials";
                if (completionPercent <= 40) return "child's hands gluing pieces";
                if (completionPercent <= 60) return "child's hands decorating craft";
                return "child's hands adding final touches";

            case CraftCategory.COLORING_BOOK:
                if (completionPercent <= 20) return "human hand drawing initial outlines";
                if (completionPercent <= 40) return "human hand adding base colors";
                if (completionPercent <= 60) return "human hand filling in details";
                return "human hand adding final shading";

            case CraftCategory.COSTUME_PROPS:
                if (completionPercent <= 20) return "human hands cutting fabric/materials";
                if (completionPercent <= 40) return "human hands sewing/assembling pieces";
                if (completionPercent <= 60) return "human hands attaching details";
                return "human hands adjusting final fit";

            default:
                return "human hands working on the craft";
        }
    }

    /**
     * Get preservation context - what should stay the SAME during refinement
     */
    protected getPreservationContext(): string {
        switch (this.category) {
            case CraftCategory.PAPERCRAFT:
                return "Keep the paper, table surface, and background exactly the same. Only the folded/cut paper craft itself should progress";

            case CraftCategory.CLAY:
                return "Keep the work surface, tools, and background exactly the same. Only the clay sculpture itself should progress";

            case CraftCategory.WOODCRAFT:
                return "Keep the workbench, tools, and background exactly the same. Only the wooden craft itself should progress";

            case CraftCategory.JEWELRY:
                return "Keep the jewelry mat/tray, background, and unused components exactly the same. Only the assembled jewelry should progress";

            case CraftCategory.KIDS_CRAFTS:
                return "Keep the craft table, supplies, and background exactly the same. Only the craft project itself should progress";

            case CraftCategory.COLORING_BOOK:
                return "Keep the paper, coloring tools, and background exactly the same. Only the drawing/coloring on the page should progress";

            case CraftCategory.COSTUME_PROPS:
                return "Keep the workspace, materials, and background exactly the same. Only the costume/prop being made should progress";

            default:
                return "Keep the background, workspace, and materials exactly the same. Only the craft itself should progress";
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
