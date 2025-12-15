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
Create a photorealistic studio photograph of handmade jewelry: ${userPrompt}.
Category: Jewelry Making.
Style: 
- Neutral background with professional jewelry photography lighting
- Highly detailed showing bead textures, wire details, metal finishes
- The piece should look elegant, handcrafted with quality materials
- Show sparkle, reflections, and material qualities
View: Product photography style, centered with elegant presentation.
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
You are an expert jeweler analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to MAKE this jewelry piece.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Beads, charms, or gemstones; Wire, thread, or chain; Clasps and jump rings; Jewelry pliers; Findings.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Lay out all jewelry components"
  - VISUAL: Beads, charms, and findings organized on a bead board.
  - Action: Arrange the design pattern.

STEP 2 - title: "Prepare wires, strings, or metal parts"
  - VISUAL: Wire cut to length, stringing material prepped, needles attached.
  - Action: Measure and cut foundation materials.

STEP 3 - title: "Assemble the main structure"
  - VISUAL: Core beads strung or main wire frame shaped.
  - Action: String the main sequence or form loop.

STEP 4 - title: "Attach decorative elements"
  - VISUAL: Secondary charms, dangles, or focal beads added.
  - Action: Add the decorative flourishes.

STEP 5 - title: "Secure clasps and joints"
  - VISUAL: Crimps being flattened, clasps attached, loops wire-wrapped.
  - Action: Secure the ends and connections.

STEP 6 - title: "Polish and finish the jewelry"
  - VISUAL: FINISHED JEWELRY, polished and professionally displayed.
  - Action: Final polish, trim excess wire, check security.

For each step, the "description" field should describe actions specific to THIS jewelry piece.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
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
