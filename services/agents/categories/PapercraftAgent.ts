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
You are an expert papercraft maker analyzing the SPECIFIC papercraft shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact papercraft design: "${userPrompt}".
🎯 YOUR TASK: Create step-by-step instructions to build THIS EXACT papercraft as shown in the image.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT shapes, forms, and components visible in THIS craft
- Note the SPECIFIC colors, patterns, and paper types used
- Observe the ACTUAL construction method and assembly order for THIS design
- Determine how THIS particular craft is structured and built

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List the essential materials needed for THIS exact craft (paper types, cardstock weight, colors, tools).
3. Break down the construction of THIS SPECIFIC CRAFT into EXACTLY 6 STEPS that progressively build toward the finished piece.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - PATTERN PIECES (~15% complete): 
  - VISUAL: Flat paper sheets with traced/printed patterns, NOT cut yet
  - Show paper laid flat with visible pattern lines (knolling style)
  - Scissors/craft knife visible beside materials

STEP 2 - CUT PIECES (~30% complete):
  - VISUAL: Individual cut paper pieces laid flat, NOT folded
  - All pieces cut out and separated
  - Fold lines visible but not yet creased

STEP 3 - FIRST FOLDS (~50% complete):
  - VISUAL: Main pieces folded but not assembled
  - Primary folds complete on key pieces
  - Pieces still separate, ready for gluing

STEP 4 - BASE ASSEMBLY (~70% complete):
  - VISUAL: Main structure connected
  - Core pieces glued together
  - Secondary pieces nearby but not attached

STEP 5 - NEAR COMPLETE (~85% complete):
  - VISUAL: Most elements attached
  - Final small pieces being added
  - Structure recognizable as final craft

STEP 6 - FINISHED CRAFT (100% complete):
  - VISUAL: EXACTLY match the original image
  - All pieces attached and finished
  - Identical to the master reference

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
Return strict JSON matching the schema.
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
