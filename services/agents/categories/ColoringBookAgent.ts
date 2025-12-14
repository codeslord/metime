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
Create a high-quality hand-drawn black and white coloring page of: ${userPrompt}.
CRITICAL REQUIREMENTS:
- BLACK OUTLINES ONLY - No colors, no shading, no gray tones
- Hand-drawn artistic style (NOT perfect vector/digital lines)
- Clean, crisp black ink lines on pure white paper texture
- Natural line weight variations typical of ink pens
- Professional illustration quality suitable for coloring
DO NOT include any colors, shading, gradients, or fills.
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
You are a coloring book artist analyzing the SPECIFIC design shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact design: "${userPrompt}".
🎯 YOUR TASK: Break down how to draw THIS EXACT design as line art for coloring.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT shapes, forms, and composition visible in THIS design
- Note the SPECIFIC details, patterns, and decorative elements used
- Observe the ACTUAL line work and drawing structure for THIS design
- Determine how THIS particular design is constructed as line art

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List drawing materials needed for THIS exact design (fine liner sizes, paper type).
3. Break down THIS SPECIFIC DESIGN into EXACTLY 6 DRAWING STEPS that progressively build toward the finished line art.

🚨 MANDATORY 6-STEP PROGRESSIVE LINE ART 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - BASIC SHAPES (~15% complete): 
  - VISUAL: Light construction lines and basic geometric shapes
  - Only the roughest outline visible
  - Guide marks for proportions

STEP 2 - MAIN OUTLINES (~30% complete):
  - VISUAL: Primary contour lines drawn
  - Main shapes defined with clean lines
  - No details yet

STEP 3 - SECONDARY LINES (~50% complete):
  - VISUAL: Secondary forms and divisions added
  - Major internal lines drawn
  - Structure clear but sparse

STEP 4 - ADDING DETAILS (~70% complete):
  - VISUAL: Detail lines being added
  - Patterns and textures emerging
  - Most major elements present

STEP 5 - FINE DETAILS (~85% complete):
  - VISUAL: Small details and decorative elements
  - Nearly complete line work
  - Final touches remaining

STEP 6 - FINISHED LINE ART (100% complete):
  - VISUAL: EXACTLY match the original image
  - All lines complete and refined
  - Ready for coloring

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
BLACK AND WHITE LINES ONLY - no shading, no colors.
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
