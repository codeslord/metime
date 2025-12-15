import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Papercraft Agent - Handles all intents for paper craft projects.
 * Specializes in paper templates, fold lines, and 3D patterns.
 */
export class PapercraftAgent extends CategoryAgentBase {
    readonly category = CraftCategory.PAPERCRAFT;

    readonly card: AgentCard = {
        name: 'PapercraftAgent',
        version: '1.0.0',
        description: 'Specialized agent for papercraft projects including origami, paper models, and pop-up cards.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.PAPERCRAFT)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a photorealistic photograph of a PHYSICAL papercraft model: ${userPrompt}.
Category: Papercraft.
Style: 
- Real paper texture and fiber visibility (NOT smooth 3D polygon render)
- Visible fold lines, scored edges, and paper thickness
- Natural shadows where paper layers overlap or stand up
- Matte or semi-gloss paper finish depending on context
- Looks folded and glued by hand
View: Isometric or front-facing to show depth.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for building this EXACT papercraft.
📷 REFERENCE IMAGE: This is the FINISHED craft.
${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Papercraft

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

PAPERCRAFT MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - PATTERN SHEETS (KNOLLING LAYOUT): Show flat pattern pieces laid out side-by-side on white background.
PANEL 2 - CUT & SCORE: Show pieces being cut and scored with fold lines marked.
PANEL 3 - ASSEMBLY: Show hands folding/gluing pieces together.
PANEL 4 - RESULT: Show completed component from this step.

CONSISTENCY: Match colors and style of reference EXACTLY.
Use dotted lines for fold marks, solid lines for cut marks.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert paper folder/modeler analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to MAKE THIS PAPERCRAFT.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Paper or cardstock, Scissors or craft knife, Glue or tape, Ruler, Scoring tool (or blunt edge).
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Cut all paper components"
  - VISUAL: Flat printout sheets with parts cut out neatly.
  - Action: Carefully cut out all pieces along the solid lines.

STEP 2 - title: "Score and fold where required"
  - VISUAL: Cut parts with fold lines creased (mountain/valley).
  - Action: Score dashed lines and pre-fold tabs.

STEP 3 - title: "Assemble the base structure"
  - VISUAL: The main body or largest section glued fast.
  - Action: Glue the primary structure tab-by-tab.

STEP 4 - title: "Attach secondary pieces"
  - VISUAL: Smaller appendages/details attached to the base.
  - Action: Add arms, wheels, or details to the main body.

STEP 5 - title: "Reinforce joints and edges"
  - VISUAL: Fully assembled model, checking alignment.
  - Action: Hold critical joints until glue sets; ensure symmetry.

STEP 6 - title: "Let the model fully set"
  - VISUAL: FINISHED MODEL, crisp and clean, EXACT match to master.
  - Action: Final display, glue completely cured.

For each step, the "description" field should describe actions specific to THIS papercraft.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a PAPERCRAFT PATTERN TEMPLATE for THIS EXACT craft from the reference image.
📷 REFERENCE IMAGE: Finished 3D craft.
${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
📦 CATEGORY: Papercraft

PATTERN REQUIREMENTS:
1. Show flat, unfolded pattern pieces that can be cut and assembled into the 3D form.
2. Include CUT LINES (solid black) and FOLD LINES (dashed).
3. Add GLUE TABS where pieces connect.
4. Label each piece clearly.
5. SAME COLORS as the reference - match exactly.
6. SAME PROPORTIONS - pieces should assemble to correct scale.

OUTPUT FORMAT:
- One organized pattern sheet with all pieces
- PLAIN WHITE background
- NO grid, NO texture
- Professional print-ready quality
`;
    }
}
