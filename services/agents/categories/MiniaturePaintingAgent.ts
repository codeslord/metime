import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Miniature Painting Agent - Handles painting of 3D prints, wood and clay models.
 * Focuses on the meditative aspects of detailed miniature work.
 */
export class MiniaturePaintingAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.MINIATURE_PAINTING;

  readonly card: AgentCard = {
    name: 'MiniaturePaintingAgent',
    version: '1.0.0',
    description: 'Specialized agent for painting miniature figures - 3D prints, wood carvings, and clay models.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.MINIATURE_PAINTING)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a high-quality photograph of a beautifully painted miniature figure: ${userPrompt}.
Category: Miniature Painting (3D prints, wood, clay models).
Style:
- Professional hobby-level painted miniature
- Clean, smooth paint layers with visible highlights and shadows
- Detailed brushwork showing weathering, shading, and fine details
- Mounted on a simple base or display stand
- Neutral background to showcase the paintwork
View: Three-quarter angle showing the best painted details.
Lighting: Soft studio lighting that shows off the paint layers beautifully.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL MINIATURE PAINTING TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED painted miniature.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Miniature Painting

CURRENT STEP: "${stepDescription}"
Show ONLY the painting progress for this step.

MINIATURE PAINTING MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - PREPARATION: Show primed miniature or current paint state.
PANEL 2 - BASE COAT: Show base colors being applied with brush.
PANEL 3 - LAYERING: Show highlights and shadows being added.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show paintbrush applying paint where appropriate
- Use thin, controlled paint layers
- Progress from base coats to detailed highlights
- Match the color scheme of the reference EXACTLY
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert miniature painter analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED miniature. Each step removes details to show an earlier stage.
Step 1 = Most simplified (raw form). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Miniature figure, Primer, Acrylic paints (list specific colors), Fine brushes (#0, #1, #2), Palette, Water cup, Paper towels.
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Raw sculpted form without any paint"
  - VISUAL: Remove ALL paint. Show the bare unpainted clay/resin miniature in its raw material color.
  - This is the starting point - user sees the blank form they'll transform.

STEP 2 - title: "Primed miniature ready for painting"
  - VISUAL: Remove all colors. Show uniform primer coat only (white/gray/black) covering the figure.
  - User sees the primed figure that needs base colors.

STEP 3 - title: "Base colors blocked in on major areas"
  - VISUAL: Remove shading, highlights, and details. Show flat base colors on skin, armor, cloth.
  - User sees the flat colors they need to apply next.

STEP 4 - title: "Shading and washes applied for depth"
  - VISUAL: Remove highlights and fine details. Show base colors WITH shading/washes in recesses.
  - User sees the shaded miniature that needs highlighting.

STEP 5 - title: "Highlights and details nearly complete"
  - VISUAL: Remove only finishing touches (varnish, extreme highlights, eye details, weathering).
  - User sees a nearly complete miniature missing only final polish.

STEP 6 - title: "Reference image with all details visible"
  - VISUAL: Show the nearly final result matching the reference with all major work complete.
  - User sees their goal - the finished miniature.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a PAINTING REFERENCE GUIDE for this miniature.
📷 REFERENCE IMAGE: Finished painted miniature.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Miniature Painting

REFERENCE GUIDE REQUIREMENTS:
1. Show COLOR PALETTE breakdown - each paint color used with swatches.
2. Include LAYERING GUIDE - base coat, shade, layer, highlight progression.
3. Show KEY TECHNIQUES - wet blending, dry brushing areas.
4. Include a STEP-BY-STEP mini progression (4 stages from primed to finished).
5. Match the painting style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Professional miniature painting tutorial quality
`;
  }
}
