import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { BriaService } from '../briaService';
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

        const fullPrompt = category === CraftCategory.COLORING_BOOK
            ? `
      Create a high-quality black and white line art coloring page of: ${prompt}.
      CRITICAL REQUIREMENTS:
      - BLACK OUTLINES ONLY - No colors, no shading, no fills, no gray tones
      - Pure line art suitable for coloring with pencils or crayons
      - Clean, crisp black lines on pure white background
      - Professional coloring book quality
      DO NOT include any colors, shading, gradients, or fills - ONLY black outlines on white background.
    `
            : `
      Create a photorealistic studio photograph of a DIY craft project: ${prompt}.
      Category: ${category}.
      Style: Neutral background, even studio lighting, highly detailed textures showing materials like fabric grain, paper fibers, wood grain, or metal. 
      The object should look tangible, handmade, and finished.
      View: Isometric or front-facing, centered.
    `;

        try {
            trackApiUsage('generateCraftImage', true); // Eagerly track attempt
            const imageUrl = await BriaService.generateImage(fullPrompt);
            return imageUrl;
        } catch (error) {
            trackApiUsage('generateCraftImage', false);
            throw error;
        }
    }

    private async generateCraftFromImage(imageBase64: string, category: CraftCategory): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            const waitTime = imageGenerationLimiter.getTimeUntilNextRequest();
            const waitSeconds = Math.ceil(waitTime / 1000);
            throw new Error(`Rate limit exceeded. Wait ${waitSeconds}s.`);
        }

        // Normalize Base64 for Bria (assuming it accepts standard base64 or data uri)
        // If Bria expects raw base64 without prefix:
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
        // Bria might want data URI or just base64. Let's pass the data URI if possible, or try raw.
        // NOTE: Without explicit "images" format docs, we try passing the full string first.
        // Actually, many APIs expect just the base64 part or a URL. 
        // For now, let's assume we pass the original string.

        const prompt = `Transform this image into a photorealistic studio photograph of a DIY craft project. Category: ${category}. Maintain form and colors.`;

        try {
            trackApiUsage('generateCraftFromImage', true);
            // Passing imageBase64 as reference
            const imageUrl = await BriaService.generateImage(prompt, [imageBase64]);
            return imageUrl;
        } catch (error) {
            trackApiUsage('generateCraftFromImage', false);
            throw error;
        }
    }

    private getCategorySpecificRules(category: CraftCategory): string {
        const categoryRules: Record<string, string> = {
            'Papercraft': `
  PAPERCRAFT MULTI-PANEL FORMAT (2-4 PANELS):
  PANEL 1 - PATTERN SHEETS (KNOLLING LAYOUT): Show flat pattern pieces laid out side-by-side.
  PANEL 2 - ASSEMBLY: Show hands folding/gluing pieces.
  PANEL 3/4 - RESULT: Show completed component.
  `,
            'Clay': `
  CLAY MULTI-PANEL FORMAT (2-4 PANELS):
  PANEL 1 - CLAY PIECES (KNOLLING): Show clay pieces organized flat.
  PANEL 2 - SHAPING: Show hands sculpting clay.
  PANEL 3/4 - RESULT: Show completed component.
  `,
        };
        return categoryRules[category] || `MULTI-PANEL FORMAT: Show materials, technique, assembly, and result.`;
    }

    private async generateStepImage(
        originalImageBase64: string,
        stepDescription: string,
        category: CraftCategory,
        targetObjectLabel?: string,
        stepNumber?: number
    ): Promise<string> {
        const categoryRules = this.getCategorySpecificRules(category);

        const prompt = `
  🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for building this EXACT craft.
  📷 REFERENCE IMAGE: This is the FINISHED craft.
  ${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
  📦 CATEGORY: ${category}
  
  CURRENT STEP: "${stepDescription}"
  Show ONLY the components mentioned in this step.
  
  MULTI-PANEL FORMAT (2-4 PANELS):
  PANEL 1 - MATERIALS
  PANEL 2 - ASSEMBLY
  PANEL 3 - DETAILS
  PANEL 4 - RESULT
  
  ${categoryRules}
  
  CONSISTENCY: Match colors and style of reference EXACTLY.
    `;

        try {
            const imageUrl = await BriaService.generateImage(prompt, [originalImageBase64]);
            return imageUrl;
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
            const imageUrl = await BriaService.generateImage(prompt, [originalImageBase64]);
            return imageUrl;
        } catch (error) {
            trackApiUsage('generateTurnTableView', false);
            throw error;
        }
    }
}
