import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Clay Agent - Handles all intents for clay/sculpting projects.
 * Specializes in sculpting references and clay piece organization.
 */
export class ClayAgent extends CategoryAgentBase {
  readonly category = CraftCategory.CLAY;

  readonly card: AgentCard = {
    name: 'ClayAgent',
    version: '1.0.0',
    description: 'Specialized agent for clay sculpting projects including polymer clay, air-dry clay, and ceramic work.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.CLAY)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a photorealistic studio photograph of a HANDMADE DIY clay craft project: ${userPrompt}.
Category: Clay Sculpting.
Style: 
- Authentic handmade aesthetic (NOT 3D render/CGI)
- Visible clay texture, minor fingerprints, and natural surface imperfections
- Soft, natural studio lighting showing the matte or glossy finish of real clay
- Tangible, physical presence with realistic weight and form
View: Isometric or front-facing, centered.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for sculpting this EXACT clay craft.
📷 REFERENCE IMAGE: This is the FINISHED sculpture.
${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Clay Sculpting

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

CLAY MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - CLAY PIECES (KNOLLING): Show clay pieces organized flat, showing colors and approximate sizes.
PANEL 2 - SHAPING: Show hands shaping/forming the clay with basic tools.
PANEL 3 - ASSEMBLY: Show pieces being attached, blending seams.
PANEL 4 - RESULT: Show completed component from this step.

CONSISTENCY: Match colors and style of reference EXACTLY.
Show tool usage where appropriate (sculpting tools, rollers, texture tools).
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert clay sculptor analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to SCULPT this subject from clay.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Clay (air-dry, polymer, or ceramic), Sculpting tools, Work surface, Water (if applicable), Paint, Sealant or varnish.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS that build the item.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Prepare and condition the clay"
  - VISUAL: Raw clay blocks, conditioned and ready, tools laid out.
  - Action: Prepare clay colors, condition materials.

STEP 2 - title: "Form the base shape"
  - VISUAL: Basic armature or core shapes (spheres, cylinders) formed.
  - Action: Build the foundational structure.

STEP 3 - title: "Sculpt primary features"
  - VISUAL: Main body/parts assembled, recognizable silhouette.
  - Action: Attach major components, block out forms.

STEP 4 - title: "Add fine details and texture"
  - VISUAL: Textures, faces, small elements added.
  - Action: Refine shapes, add fur/scales/details.

STEP 5 - title: "Dry, bake, or fire the clay"
  - VISUAL: Completed raw sculpt ready for oven.
  - Action: Final smoothing, prep for baking/firing.

STEP 6 - title: "Paint and seal the finished piece"
  - VISUAL: FINISHED PIECE, painted and glossy/sealed, EXACT match to master.
  - Action: Apply paint, wash, glaze, and sealer.

For each step, the "description" field should describe actions specific to THIS craft.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a CLAY SCULPTING REFERENCE SHEET for THIS EXACT craft from the reference image.
📷 REFERENCE IMAGE: Finished 3D sculpture.
      ${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
📦 CATEGORY: Clay Sculpting

REFERENCE SHEET REQUIREMENTS:
    1. Show clay piece breakdown - individual shapes that combine to form the sculpture.
2. Include SIZE REFERENCES for each piece(relative balls / coils of clay).
3. Show COLOR MIXING guides if multiple colors are used.
4. Label each component clearly.
5. SAME COLORS as the reference - match exactly.
6. SAME PROPORTIONS - pieces should combine to correct scale.

OUTPUT FORMAT:
    - One organized reference sheet with all clay pieces
      - PLAIN WHITE background
        - Show pieces as simple 3D shapes(balls, coils, flat pieces)
          - Professional sculpting guide quality
            `;
  }
}
