import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Coloring Book Agent - Handles progressive coloring of line art.
 * The master image is a black and white line art page.
 * Steps show progressive coloring using FIBO refinement from the master.
 */
export class ColoringBookAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.COLORING_BOOK;

  readonly card: AgentCard = {
    name: 'ColoringBookAgent',
    version: '1.0.0',
    description: 'Specialized agent for coloring book style art - progressively adding colors to line art.',
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
- Clear, well-defined areas ready to be filled with color
DO NOT include any colors, shading, gradients, or fills.
The output is a LINE ART coloring page ready to be colored in steps.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a progressively colored version of the line art.
📷 REFERENCE IMAGE: This is the MASTER LINE ART to color.
${targetObjectLabel ? `🎨 DESIGN: ${targetObjectLabel}` : ''}
📦 CATEGORY: Coloring Book - Progressive Coloring

CURRENT STEP: "${stepDescription}"

PROGRESSIVE COLORING APPROACH:
This step should show the line art WITH COLORS progressively added.
- Maintain the EXACT same line art composition
- Add colors ONLY to the areas described in this step
- Keep uncolored areas as clean black lines on white
- Use vibrant but harmonious colors
- Show the coloring IN PROGRESS (not fully finished unless this is the last step)

STYLE REQUIREMENTS:
- Same line art, same composition
- Colored pencil or marker aesthetic
- Natural blending and shading
- Match the step description for which areas are colored
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert colorist analyzing this coloring page: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to progressively COLOR this line art design.

CRITICAL: Each step will REFINE the previous step's image, adding MORE color progressively.
- Step 1 starts from the black and white line art
- Each subsequent step adds more color to the previous step's output
- Step 6 should be the fully colored final result

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Coloring book or printed page; Colored pencils, crayons, or markers; Eraser; Blending tool or tissue (optional).
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Begin with the main background color"
  - VISUAL: Line art with ONLY the background area lightly colored.
  - Action: Apply a light, even base to the largest background area.
  - REFINES: Master line art (black and white)

STEP 2 - title: "Color the primary subject's base"
  - VISUAL: Background colored + main subject has base colors.
  - Action: Add flat base colors to the main focal point.
  - REFINES: Step 1 output

STEP 3 - title: "Add secondary element colors"
  - VISUAL: More elements now have color (about 50% colored).
  - Action: Color secondary subjects and supporting elements.
  - REFINES: Step 2 output

STEP 4 - title: "Fill in remaining details"
  - VISUAL: Most areas now colored (about 75% complete).
  - Action: Color small details, patterns, and accents.
  - REFINES: Step 3 output

STEP 5 - title: "Add shading and depth"
  - VISUAL: All areas colored with shadows and dimension.
  - Action: Add darker tones for shading, blend colors.
  - REFINES: Step 4 output

STEP 6 - title: "Final highlights and polish"
  - VISUAL: FULLY COLORED masterpiece with vibrant depth.
  - Action: Add highlights, final blending, clean up edges.
  - REFINES: Step 5 output (this is the FINAL colored version)

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
