import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { getAiClient, retryWithBackoff } from '../aiUtils';
import { imageGenerationLimiter, dissectionLimiter, trackApiUsage } from '../../utils/rateLimiter';
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
                    result = await this.generateStepImage(
                        task.payload.originalImageBase64,
                        task.payload.stepDescription,
                        task.payload.targetObjectLabel,
                        task.payload.stepNumber
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

    protected async generateMasterImage(prompt: string): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s.`);
        }

        const ai = getAiClient();
        const fullPrompt = this.getMasterImagePrompt(prompt);

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: fullPrompt }] },
                config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    trackApiUsage('generateMasterImage', true);
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            trackApiUsage('generateMasterImage', false);
            throw new Error("Failed to generate master image");
        }).catch((error) => {
            trackApiUsage('generateMasterImage', false);
            throw error;
        });
    }

    protected async generateCraftFromImage(imageBase64: string): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s.`);
        }

        const ai = getAiClient();
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        const prompt = this.getMasterImagePrompt('Transform this into a craft reference');

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                        { text: prompt },
                    ],
                },
                config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    trackApiUsage('generateCraftFromImage', true);
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            trackApiUsage('generateCraftFromImage', false);
            throw new Error("Failed to generate craft from image");
        }).catch((error) => {
            trackApiUsage('generateCraftFromImage', false);
            throw error;
        });
    }

    protected async generateStepImage(
        originalImageBase64: string,
        stepDescription: string,
        targetObjectLabel?: string,
        stepNumber?: number
    ): Promise<string> {
        const ai = getAiClient();
        const cleanBase64 = originalImageBase64.split(',')[1] || originalImageBase64;
        const prompt = this.getStepImagePrompt(stepDescription, targetObjectLabel);

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                        { text: prompt },
                    ],
                },
                config: {
                    imageConfig: { aspectRatio: "16:9" },
                    thinkingConfig: { includeThoughts: true }
                },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            throw new Error("Failed to generate step image");
        });
    }

    protected async dissectCraft(imageBase64: string, userPrompt: string): Promise<DissectionResponse> {
        if (!dissectionLimiter.canMakeRequest()) {
            const waitTime = dissectionLimiter.getTimeUntilNextRequest();
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s.`);
        }

        const ai = getAiClient();
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
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

        const ai = getAiClient();
        const cleanBase64 = originalImageBase64.split(',')[1] || originalImageBase64;
        const prompt = this.getPatternSheetPrompt(craftLabel);

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                        { text: prompt },
                    ],
                },
                config: {
                    imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
                    thinkingConfig: { includeThoughts: true }
                },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    trackApiUsage('generatePatternSheet', true);
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            trackApiUsage('generatePatternSheet', false);
            throw new Error("Failed to generate pattern sheet");
        }).catch(e => {
            trackApiUsage('generatePatternSheet', false);
            throw e;
        });
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
