import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { getAiClient, retryWithBackoff } from '../aiUtils';
import { imageGenerationLimiter, trackApiUsage } from '../../utils/rateLimiter';
import { CraftCategory } from '../../types';

export class PatternAgent extends AgentBase {
    readonly card: AgentCard = {
        name: 'PatternAgent',
        version: '1.0.0',
        description: 'Generates technical pattern sheets and templates for crafts.',
        capabilities: [
            {
                intent: 'generate_pattern_sheet',
                description: 'Generate a manufacturing-ready pattern sheet for the craft.',
                inputSchema: { originalImageBase64: 'string', category: 'CraftCategory', craftLabel: 'string' }
            }
        ]
    };

    async processTask(task: A2AMessage): Promise<A2AMessage> {
        const { intent } = task.payload;

        try {
            let result;
            switch (intent) {
                case 'generate_pattern_sheet':
                    result = await this.generateSVGPatternSheet(
                        task.payload.originalImageBase64,
                        task.payload.category,
                        task.payload.craftLabel
                    );
                    break;
                default:
                    throw new Error(`Unknown intent: ${intent}`);
            }
            return this.createResponse(task, { result });
        } catch (error: any) {
            return this.createErrorResponse(task, error.message || 'Unknown error in PatternAgent');
        }
    }

    private async generateSVGPatternSheet(
        originalImageBase64: string,
        category: CraftCategory,
        craftLabel?: string
    ): Promise<string> {
        if (!imageGenerationLimiter.canMakeRequest()) {
            throw new Error(`Rate limit exceeded.`);
        }

        const ai = getAiClient();
        const cleanBase64 = originalImageBase64.split(',')[1] || originalImageBase64;

        // Simplification for brevity, ensuring critical logic is retained
        const patternType = this.getCategoryPatternType(category);

        const prompt = `
    🎯 YOUR TASK: Create a ${patternType} for THIS EXACT craft from the reference image.
    📷 REFERENCE IMAGE: Finished 3D craft.
    ${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
    📦 CATEGORY: ${category}
    
    CONSISTENCY REQUIREMENTS:
    1. SAME COLORS - Match reference exactly.
    2. SAME PROPORTIONS.
    3. SAME DETAILS.
    
    OUTPUT FORMAT:
    One organized pattern sheet with labeled pieces.
    - Cut lines (solid), Fold lines (dashed), Glue tabs.
    - PLAIN WHITE background.
    - NO grid, NO texture.
    `;

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
                    trackApiUsage('generateSVGPatternSheet', true);
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            trackApiUsage('generateSVGPatternSheet', false);
            throw new Error("Failed to generate SVG pattern sheet");
        }).catch(e => {
            trackApiUsage('generateSVGPatternSheet', false);
            throw e;
        });
    }

    private getCategoryPatternType(cat: CraftCategory): string {
        switch (cat) {
            case CraftCategory.PAPERCRAFT: return 'papercraft pattern template with 3D unwrapped patterns';
            case CraftCategory.CLAY: return 'clay sculpting reference sheet';
            case CraftCategory.COSTUME_PROPS: return 'foam armor/prop pattern template';
            case CraftCategory.WOODCRAFT: return 'woodworking pattern sheet';
            case CraftCategory.JEWELRY: return 'jewelry assembly diagram';
            case CraftCategory.KIDS_CRAFTS: return 'simple craft template';
            case CraftCategory.COLORING_BOOK: return 'detailed black and white line art coloring page';
            default: return 'craft pattern template';
        }
    }
}
