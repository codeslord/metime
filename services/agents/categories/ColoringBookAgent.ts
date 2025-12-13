import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Coloring Book Agent - Handles all intents for coloring book page generation.
 * Specializes in black and white line art suitable for coloring.
 */
export class ColoringBookAgent extends CategoryAgentBase {
    readonly category = CraftCategory.COLORING_BOOK;

    readonly card: AgentCard = {
        name: 'ColoringBookAgent',
        version: '1.0.0',
        description: 'Specialized agent for generating coloring book style line art.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.COLORING_BOOK)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality black and white line art coloring page of: ${userPrompt}.
CRITICAL REQUIREMENTS:
- BLACK OUTLINES ONLY - No colors, no shading, no fills, no gray tones
- Pure line art suitable for coloring with pencils or crayons
- Clean, crisp black lines on pure white background
- Professional coloring book quality
- Detailed but not overly complex for comfortable coloring
- Clear defined areas for coloring
DO NOT include any colors, shading, gradients, or fills - ONLY black outlines on white background.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL LINE ART instruction for this coloring page.
📷 REFERENCE IMAGE: This is the design to recreate.
${targetObjectLabel ? `🎨 DESIGN: ${targetObjectLabel}` : ''}
📦 CATEGORY: Coloring Book

CURRENT STEP: "${stepDescription}"

COLORING BOOK PANEL FORMAT:
PANEL 1 - OUTLINE: Show basic outline structure.
PANEL 2 - DETAILS: Show added detail lines.
PANEL 3 - FINAL: Show complete line art ready for coloring.

CRITICAL: BLACK AND WHITE LINE ART ONLY.
No colors, no shading, no fills - pure outlines on white background.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are a coloring book artist. Analyze this image: "${userPrompt}".
YOUR TASK: Break down how to draw this as line art for coloring.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List drawing materials (fine liner sizes, paper type).
3. Break down into EXACTLY 4 DRAWING STEPS.

🚨 MANDATORY 4-STEP LINE ART GROUPING 🚨
STEP 1 - BASIC SHAPES: Outline the main forms and proportions.
STEP 2 - PRIMARY DETAILS: Add main detail lines and features.
STEP 3 - SECONDARY DETAILS: Add smaller details and patterns.
STEP 4 - FINISHING LINES: Add final decorative elements and cleanup lines.

Focus on creating clear coloring areas.
Return strict JSON matching the schema.
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a DETAILED BLACK AND WHITE LINE ART COLORING PAGE from the reference image.
📷 REFERENCE IMAGE: Design to convert to line art.
${craftLabel ? `🎨 DESIGN: ${craftLabel}` : ''}
📦 CATEGORY: Coloring Book

COLORING PAGE REQUIREMENTS:
1. PURE BLACK OUTLINES on WHITE background only.
2. NO colors, NO shading, NO gradients, NO fills.
3. Clear, well-defined areas for coloring.
4. Appropriate line weight variation for depth.
5. Professional coloring book quality.

OUTPUT FORMAT:
- Single coloring page
- PURE WHITE background
- CLEAN BLACK LINES only
- Print-ready quality at high resolution
`;
    }
}
