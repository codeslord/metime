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
You are an expert jewelry maker analyzing the SPECIFIC jewelry piece shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact jewelry piece: "${userPrompt}".
🎯 YOUR TASK: Create step-by-step instructions to make THIS EXACT piece as shown in the image.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT bead types, colors, sizes, and arrangement visible in THIS piece
- Note the SPECIFIC wire gauge, metal finish, and findings used
- Observe the ACTUAL construction technique and assembly pattern for THIS design
- Determine how THIS particular piece is structured and connected

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List the essential materials needed for THIS exact piece (specific beads with colors/sizes, wire gauge, findings, tools).
3. Break down the construction of THIS SPECIFIC JEWELRY into EXACTLY 6 STEPS that progressively build toward the finished piece.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - MATERIALS LAID OUT (~15% complete): 
  - VISUAL: All beads, wire, and findings organized flat (knolling style)
  - Show components sorted by type and color
  - Tools visible beside materials

STEP 2 - WIRE PREPARATION (~30% complete):
  - VISUAL: Wire cut to length, findings attached to ends
  - Clasps/closures attached but stringing not started
  - Beads still separate nearby

STEP 3 - INITIAL STRINGING (~50% complete):
  - VISUAL: First portion of beads strung
  - Pattern starting to emerge
  - Remaining beads nearby

STEP 4 - PATTERN COMPLETE (~70% complete):
  - VISUAL: Main bead pattern finished
  - Decorative elements being added
  - Nearly complete but unfinished ends

STEP 5 - NEAR COMPLETE (~85% complete):
  - VISUAL: All beads strung and positioned
  - Final connections in progress
  - Just needs finishing touches

STEP 6 - FINISHED PIECE (100% complete):
  - VISUAL: EXACTLY match the original image
  - All connections complete
  - Identical to the master reference

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
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
