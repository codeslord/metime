import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { BriaService } from '../briaService';
import { PromptEngineeringService } from '../promptEngineering';
import { imageGenerationLimiter, trackApiUsage } from '../../utils/rateLimiter';
import { CraftCategory } from '../../types';

export class VisualizerAgent extends AgentBase {
    readonly card: AgentCard = {
        name: 'VisualizerAgent',
        version: '1.0.0',
        description: 'Generates visual assets for crafts including master images, step visualizations, and turn tables using Bria AI.',
        capabilities: [
            {
                intent: 'generate_master_image',
                description: 'Generate a photorealistic master reference image for a craft idea.',
                inputSchema: { prompt: 'string', category: 'CraftCategory' }
            },
            {
                intent: 'generate_craft_from_image',
                description: 'Transform an uploaded image into a craft reference.',
                inputSchema: { imageBase64: 'string', category: 'CraftCategory' }
            },
            {
                intent: 'generate_step_image',
                description: 'Generate a visualization for a specific instruction step.',
                inputSchema: { originalImageBase64: 'string', stepDescription: 'string', category: 'CraftCategory', targetObjectLabel: 'string', stepNumber: 'number' }
            },
            {
                intent: 'generate_turntable',
                description: 'Generate a specific view angle (left/right/back) of the craft.',
                inputSchema: { originalImageBase64: 'string', view: 'left | right | back', craftLabel: 'string' }
            }
        ]
    };

    async processTask(task: A2AMessage): Promise<A2AMessage> {
        const { intent } = task.payload;

        try {
            let result;
            switch (intent) {
                case 'generate_master_image':
                    result = await this.generateCraftImage(task.payload.prompt, task.payload.category);
                    break;
                case 'generate_craft_from_image':
                    result = await this.generateCraftFromImage(task.payload.imageBase64, task.payload.category);
                    break;
                case 'generate_step_image':
                    result = await this.generateStepImage(
                        task.payload.originalImageBase64,
                        task.payload.stepDescription,
                        task.payload.category,
                        task.payload.targetObjectLabel,
                        task.payload.stepNumber
                    );
                    break;
                case 'generate_turntable':
                    result = await this.generateTurnTableView(
                        task.payload.originalImageBase64,
                        task.payload.view,
                        task.payload.craftLabel
                    );
                    break;
                default:
                    throw new Error(`Unknown intent: ${intent}`);
            }
            return this.createResponse(task, { result });
        } catch (error: any) {
            return this.createErrorResponse(task, error.message || 'Unknown error in VisualizerAgent');
        }
    }

    // --- Private Implementation Methods (Migrated to Bria AI) ---

    private async generateCraftImage(prompt: string, category: CraftCategory): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            const waitSeconds = Math.ceil(waitTime / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before generating another image.`);
        }

        try {
            trackApiUsage('generateCraftImage', true); // Eagerly track attempt

            // 1. Generate Structured Prompt for generic visualizer as well
            const structuredPrompt = await PromptEngineeringService.createMasterPrompt(prompt, category);

            // 2. Generate Image
            const result = await BriaService.generateImage('', undefined, structuredPrompt);
            return result.imageUrl;
        } catch (error) {
            trackApiUsage('generateCraftImage', false);
            throw error;
        }
    }

    private async generateCraftFromImage(imageBase64: string, category: CraftCategory): Promise<{ imageUrl: string; structuredPrompt: any; seed: number }> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            const waitSeconds = Math.ceil(waitTime / 1000);
            throw new Error(`Rate limit exceeded. Wait ${waitSeconds}s.`);
        }

        try {
            trackApiUsage('generateCraftFromImage', true);

            // Step 1: Generate structured prompt from the uploaded image
            console.log('Generating structured prompt from uploaded image...');
            const structuredPrompt = await BriaService.generateStructuredPrompt(imageBase64);
            console.log('Structured prompt generated:', structuredPrompt);

            // Step 2: Generate the craft image using the structured prompt
            console.log('Generating craft image with structured prompt...');
            const result = await BriaService.generateImage('', undefined, structuredPrompt);

            console.log('Craft image generated successfully:', result.imageUrl);
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

    private getCategorySpecificRules(category: CraftCategory): string {
        // This is less relevant now that VLM handles it, but keeping it for legacy or V1 fallback if needed
        const categoryRules: Record<string, string> = {
            'Papercraft': `PAPERCRAFT MULTI-PANEL FORMAT...`,
        };
        return categoryRules[category] || `MULTI-PANEL FORMAT...`;
    }

    private async generateStepImage(
        originalImageBase64: string,
        stepDescription: string,
        category: CraftCategory,
        targetObjectLabel?: string,
        stepNumber?: number
    ): Promise<string> {
        try {
            // 1. Generate structured prompt from original image
            const baseStructuredPrompt = await BriaService.generateStructuredPrompt(originalImageBase64);

            // 2. Adapt the structured prompt for step
            const stepStructuredPrompt = await PromptEngineeringService.adaptPromptForStep(
                baseStructuredPrompt,
                stepDescription,
                category
            );

            // 3. Generate image
            const result = await BriaService.generateImage('', undefined, stepStructuredPrompt);
            return result.imageUrl;
        } catch (error) {
            throw new Error("Failed to generate step image");
        }
    }

    private async generateTurnTableView(
        originalImageBase64: string,
        view: 'left' | 'right' | 'back',
        craftLabel?: string
    ): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) throw new Error('Rate limit exceeded');

        const prompt = `Generate a ${view.toUpperCase()} side view of this craft character by rotating the camera around it. ${craftLabel ? `CHARACTER: ${craftLabel}` : ''}`;

        try {
            trackApiUsage('generateTurnTableView', true);
            // Generate structured prompt first from the original image
            const structuredPrompt = await BriaService.generateStructuredPrompt(originalImageBase64);
            const result = await BriaService.generateImage('', undefined, structuredPrompt);
            const imageUrl = result.imageUrl;
            return imageUrl;
        } catch (error) {
            trackApiUsage('generateTurnTableView', false);
            throw error;
        }
    }
}

