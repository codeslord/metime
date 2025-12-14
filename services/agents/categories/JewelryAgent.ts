import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Jewelry Agent - Handles all intents for jewelry making projects.
 * Specializes in assembly diagrams and beading patterns.
 */
export class JewelryAgent extends CategoryAgentBase {
    readonly category = CraftCategory.JEWELRY;

    readonly card: AgentCard = {
        name: 'JewelryAgent',
        version: '1.0.0',
        description: 'Specialized agent for jewelry making including beading, wire work, and resin crafts.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.JEWELRY)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a macro photograph of a HANDMADE jewelry piece: ${userPrompt}.
Category: Jewelry Making.
Style: 
- Authentic handcrafted aesthetic (NOT CAD/3D render)
- Visible wire wrapping craftsmanship, slight irregularities of handmade work
- Realistic metallic luster and natural gemstone/bead textures
- Soft natural lighting catching the facets and curves
- Looks like an artisan piece on a display surface
View: High-angle product shot, close-up details.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for making this EXACT jewelry piece.
📷 REFERENCE IMAGE: This is the FINISHED piece.
${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Jewelry Making

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

JEWELRY MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - MATERIALS (KNOLLING): Show beads, wire, findings organized by type and color.
PANEL 2 - TECHNIQUE: Show the specific technique (stringing, wire wrapping, linking).
PANEL 3 - ASSEMBLY: Show pieces being connected or patterns being built.
PANEL 4 - RESULT: Show completed component from this step.

CONSISTENCY: Match colors, bead types, and metal finishes EXACTLY.
Show close-up detail for intricate techniques.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert jewelry maker. Analyze this image of handmade jewelry: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to make THIS piece.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List the essential materials (beads, wire gauge, findings, tools).
3. Break down the construction into EXACTLY 4 STEPS.

🚨 MANDATORY 4-STEP JEWELRY GROUPING 🚨
STEP 1 - PREPARATION: Gather materials, cut wire/thread to length, organize beads.
STEP 2 - FOUNDATION: Create base structure, main chain or foundation element.
STEP 3 - EMBELLISHMENT: Add decorative elements, beads, charms.
STEP 4 - FINISHING: Add clasps, clean up wire ends, polish.

Include bead counts and wire lengths where applicable.
Return strict JSON matching the schema.
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a JEWELRY ASSEMBLY DIAGRAM for THIS EXACT piece from the reference image.
📷 REFERENCE IMAGE: Finished jewelry piece.
${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
📦 CATEGORY: Jewelry Making

DIAGRAM REQUIREMENTS:
1. Show a BEAD/COMPONENT LAYOUT with exact arrangement.
2. Include connector details and finding placements.
3. Show pattern repeats if applicable.
4. Label bead types, sizes, and quantities.
5. SAME COLORS and materials as the reference.

OUTPUT FORMAT:
- One organized assembly diagram
- PLAIN WHITE background
- Clear labeling of all components
- Professional jewelry pattern quality
`;
    }
}
