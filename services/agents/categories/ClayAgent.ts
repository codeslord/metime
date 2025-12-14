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
You are an expert clay sculptor. Analyze this image of a clay craft project: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to sculpt THIS piece.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List the essential materials (clay type, sculpting tools, armature materials if needed).
3. Break down the sculpting into EXACTLY 4 STEPS grouped by body parts/components.

🚨 MANDATORY 4-STEP CLAY GROUPING 🚨
STEP 1 - ARMATURE & BASE: Core structure, base form, armature if needed.
STEP 2 - PRIMARY SHAPES: Main body masses, head, torso.
STEP 3 - SECONDARY FORMS: Limbs, appendages, attached elements.
STEP 4 - DETAILS & TEXTURE: Surface details, facial features, textures, finishing.

Include notes about clay conditioning and blending where applicable.
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
