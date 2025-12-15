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

COLORING BOOK PANEL FORMAT (3-4 PANELS):
PANEL 1 - ROUGH SKETCH: Show light pencil sketch of basic composition.
PANEL 2 - CLEAN LINES: Show ink lines being applied over sketch.
PANEL 3 - DETAILS: Show textures and internal patterns added.
PANEL 4 - FINAL: Show complete line art ready for coloring.

CRITICAL: BLACK AND WHITE LINE ART ONLY.
No colors, no shading, no fills - pure outlines on white background.
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert colorist analyzing this coloring page: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to COLOR this design beautifully.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Coloring book or printed page; Colored pencils, crayons, or markers; Eraser; Blending tool or tissue (optional).
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Review the image and identify main areas"
  - VISUAL: Uncolored line art with key sections highlighted/pointed out.
  - Action: Plan the color scheme and identify main subjects.

STEP 2 - title: "Choose a color palette"
  - VISUAL: Swatches of selected colors shown next to the line art.
  - Action: Select specific pencils/markers for harmony.

STEP 3 - title: "Apply base colors to large sections"
  - VISUAL: Large areas filled with solid, light base layers.
  - Action: Apply the foundation colors to the biggest sections.

STEP 4 - title: "Color smaller details and accents"
  - VISUAL: Smaller elements (flowers, gems, eyes) colored in.
  - Action: Fill in the tiny patterns and accent areas.

STEP 5 - title: "Add shading or highlights"
  - VISUAL: Gradients and depth added over base colors.
  - Action: Add darker shades for shadow and white/lighter for highlights.

STEP 6 - title: "Finalize and clean up edges"
  - VISUAL: FINISHED PAGE, fully colored with vibrant depth, EXACT match to master.
  - Action: clean up stray marks, blend final transitions.

For each step, the "description" field should describe actions specific to THIS coloring page.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
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
