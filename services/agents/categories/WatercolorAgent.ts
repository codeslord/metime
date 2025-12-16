import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Watercolor Agent - Handles watercolor painting projects.
 * Focuses on the flowing, meditative nature of watercolor techniques.
 */
export class WatercolorAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.WATERCOLOR;

  readonly card: AgentCard = {
    name: 'WatercolorAgent',
    version: '1.0.0',
    description: 'Specialized agent for watercolor painting with focus on wet-on-wet, blending, and wash techniques.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.WATERCOLOR)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a high-quality photograph of a beautiful watercolor painting: ${userPrompt}.
Category: Watercolor Painting.
Style:
- Traditional watercolor on quality paper
- Soft, flowing washes with visible pigment granulation
- Transparent layers and gentle color blending
- Visible paper texture through paint
- Artistic, handmade aesthetic
View: Flat, top-down view of the painting on a clean surface.
Lighting: Natural lighting that shows the watercolor translucency.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL WATERCOLOR PAINTING TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED watercolor painting.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Watercolor Painting

CURRENT STEP: "${stepDescription}"
Show ONLY the painting progress for this step.

WATERCOLOR MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - SKETCH: Show light pencil sketch on paper.
PANEL 2 - FIRST WASH: Show initial wet washes being applied.
PANEL 3 - BUILDING: Show secondary layers and details.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show brush and water where appropriate
- Use soft, wet edges characteristic of watercolor
- Progress from light washes to detailed layers
- Match the color palette of the reference EXACTLY
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert watercolor artist analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED watercolor. Each step removes color layers to show an earlier stage.
Step 1 = Most simplified (pencil sketch only). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

CRITICAL INSTRUCTION - PAINTING ONLY:
- The 'description' for each step must focus ONLY on watercolor painting techniques (washes, glazing, lifting).
- Match the wet-on-wet or wet-on-dry process.
- DO NOT describe manufacturing paper or stretching canvas.
- Assume the paper is stretched and ready.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Watercolor paper (cold press), Watercolor paints (list specific colors), Round brushes (various sizes), Flat wash brush, Water containers (2), Paper towels, Masking tape, Palette.
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Pencil sketch on blank paper"
  - VISUAL: Remove ALL color. Show only a light pencil outline sketch on white watercolor paper.
  - DESCRIPTION CONSTRAINT: Describe the pencil sketch composition.

STEP 2 - title: "First light wash in background"
  - VISUAL: Remove all color layers except one pale background wash. Show sketch with single diluted color.
  - DESCRIPTION CONSTRAINT: Describe applying the initial background wash.

STEP 3 - title: "Base washes on all major areas"
  - VISUAL: Remove all layering. Show first wash layer on each major area - palest version of each color.
  - DESCRIPTION CONSTRAINT: Describe applying base washes to subjects.

STEP 4 - title: "Second layer building depth"
  - VISUAL: Remove 3rd and 4th layers. Show two layers of washes - beginning to have depth but not saturated.
  - DESCRIPTION CONSTRAINT: Describe layering specifically for depth.

STEP 5 - title: "Rich layers with emerging details"
  - VISUAL: Remove fine details and final touches. Show most color layers but lacking crisp details and darkest values.
  - DESCRIPTION CONSTRAINT: Describe adding richer colors and definition.

STEP 6 - title: "Reference image with all layers visible"
  - VISUAL: Show the nearly final result with all color layers - matching the reference painting.
  - DESCRIPTION CONSTRAINT: Describe final details and textures.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a PAINTING GUIDE for this watercolor.
📷 REFERENCE IMAGE: Finished watercolor painting.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Watercolor Painting

GUIDE REQUIREMENTS:
1. Show SKETCH OUTLINE - traceable line drawing.
2. Include COLOR MIXING GUIDE - paint colors and mixes used.
3. Show WASH ORDER - which areas to paint first.
4. Include TECHNIQUE NOTES - wet-on-wet vs dry brush areas.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Suitable for beginner watercolorists
`;
  }
}
