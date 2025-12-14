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
You are an expert clay sculptor analyzing the SPECIFIC clay sculpture shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact clay piece: "${userPrompt}".
🎯 YOUR TASK: Create step-by-step instructions to sculpt THIS EXACT piece as shown in the image.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT forms, shapes, and proportions visible in THIS sculpture
- Note the SPECIFIC clay colors, textures, and surface details used
- Observe the ACTUAL construction method and assembly order for THIS design
- Determine how THIS particular sculpture is structured (solid, hollow, armature-based)

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List the essential materials needed for THIS exact piece (clay type, specific colors, sculpting tools, armature materials if visible).
3. Break down the sculpting of THIS SPECIFIC PIECE into EXACTLY 6 STEPS that progressively build toward the finished sculpture.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - RAW MATERIALS (~15% complete): 
  - VISUAL: Clay balls/pieces organized flat, NOT shaped yet
  - Show conditioned clay separated by color (knolling style)
  - Sculpting tools visible beside materials

STEP 2 - BASIC FORMS (~30% complete):
  - VISUAL: Primary shapes roughed out but separate
  - Main body mass shaped loosely
  - Pieces not yet attached to each other

STEP 3 - PRIMARY ASSEMBLY (~50% complete):
  - VISUAL: Core pieces attached together
  - Main body structure formed
  - Secondary pieces nearby but not attached

STEP 4 - SECONDARY FORMS (~70% complete):
  - VISUAL: Most components connected
  - Limbs/appendages attached
  - Form recognizable as final piece

STEP 5 - DETAILING (~85% complete):
  - VISUAL: Nearly complete sculpture
  - Fine details and textures being added
  - Surface smoothing in progress

STEP 6 - FINISHED SCULPTURE (100% complete):
  - VISUAL: EXACTLY match the original image
  - All details complete, surface finished
  - Identical to the master reference

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
Return strict JSON matching the schema.
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
2. Include SIZE REFERENCES for each piece (relative balls/coils of clay).
3. Show COLOR MIXING guides if multiple colors are used.
4. Label each component clearly.
5. SAME COLORS as the reference - match exactly.
6. SAME PROPORTIONS - pieces should combine to correct scale.

OUTPUT FORMAT:
- One organized reference sheet with all clay pieces
- PLAIN WHITE background
- Show pieces as simple 3D shapes (balls, coils, flat pieces)
- Professional sculpting guide quality
`;
    }
}
