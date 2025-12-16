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
You are an expert colorist analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FULLY COLORED result. Each step removes color to show an earlier stage.
Step 1 = Most simplified (uncolored line art). Step 6 = Nearly identical to reference.
Users START at Step 1 (blank line art) and work TOWARD the colorful reference image.

CRITICAL INSTRUCTION - COLORING ONLY:
- The 'description' for each step must focus ONLY on the coloring process (filling, blending, shading).
- DO NOT describe drawing the outlines, inking, or creating the page.
- Assume the user has a printed coloring book page ready to color.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Coloring book or printed page; Colored pencils, crayons, or markers; Eraser; Blending tool or tissue (optional).
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Uncolored line art ready to begin"
  - VISUAL: Remove ALL color. Show pure black and white line art on white paper.
  - DESCRIPTION CONSTRAINT: Describe the blank page ready for color. Do NOT say "Draw the lines".

STEP 2 - title: "Background area lightly colored"
  - VISUAL: Remove all color except background. Show line art with only the largest background area colored.
  - DESCRIPTION CONSTRAINT: Describe coloring the background.

STEP 3 - title: "Main subject with base colors"
  - VISUAL: Remove secondary colors. Show background + main subject colored (~50% complete).
  - DESCRIPTION CONSTRAINT: Describe applying base colors to the main subject.

STEP 4 - title: "Most areas filled with flat color"
  - VISUAL: Remove shading and detail coloring. Show ~75% colored with flat colors, no blending.
  - DESCRIPTION CONSTRAINT: Describe filling remaining areas with flat color.

STEP 5 - title: "All areas colored with basic shading"
  - VISUAL: Remove highlights and polish. Show fully colored but lacking final depth and highlights.
  - DESCRIPTION CONSTRAINT: Describe adding basic shading.

STEP 6 - title: "Reference image fully colored"
  - VISUAL: Show the nearly final result with rich color, shading, and highlights - matching the reference.
  - DESCRIPTION CONSTRAINT: Describe final blending and highlights.

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
