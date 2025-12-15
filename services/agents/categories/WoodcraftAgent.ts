import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Woodcraft Agent - Handles all intents for woodworking projects.
 * Specializes in woodworking patterns and cut diagrams.
 */
export class WoodcraftAgent extends CategoryAgentBase {
    readonly category = CraftCategory.WOODCRAFT;

    readonly card: AgentCard = {
        name: 'WoodcraftAgent',
        version: '1.0.0',
        description: 'Specialized agent for woodworking projects including carpentry, whittling, and wood burning.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.WOODCRAFT)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a photorealistic photograph of a HANDCRAFTED wooden object: ${userPrompt}.
Category: Woodcraft.
Style: 
- Authentic workshop aesthetic (NOT 3D furniture render)
- Visible wood grain, saw marks at joints, and natural wood finish
- Real joinery details and physically accurate construction
- Natural warmth of wood captured in lighting
- Looks like a finished piece sitting on a workbench
View: Isometric or perspective view.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for building this EXACT woodcraft.
📷 REFERENCE IMAGE: This is the FINISHED piece.
${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Woodcraft

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

WOODCRAFT MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - MATERIALS (KNOLLING): Show wood pieces, hardware, and tools laid out flat.
PANEL 2 - CUTTING/SHAPING: Show sawing, drilling, or carving operations.
PANEL 3 - ASSEMBLY: Show pieces being joined, glued, or fastened.
PANEL 4 - RESULT: Show completed component from this step.

CONSISTENCY: Match wood type and finish of reference EXACTLY.
Show appropriate safety equipment where power tools are used.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert woodworker analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to BUILD this wooden item.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Wood pieces, Saw or cutting tool, Wood glue or fasteners, Sandpaper, Finish, stain, or sealant.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Measure and mark wood pieces"
  - VISUAL: Raw lumber with pencil markings and tape measure.
  - Action: Mark all cut lines on the wood.

STEP 2 - title: "Cut components to size"
  - VISUAL: All wood pieces cut to correct dimensions, stacked neatly.
  - Action: Saw/cut the components.

STEP 3 - title: "Assemble the structure"
  - VISUAL: Main pieces dry-fitted or clamped together.
  - Action: Initial assembly of the frame/box.

STEP 4 - title: "Secure joints with fasteners or glue"
  - VISUAL: Screws, nails, or glue being applied; clamps in place.
  - Action: Permanently fasten the structure.

STEP 5 - title: "Sand all surfaces smooth"
  - VISUAL: Assembled item with smooth, sanded wood; dust visible.
  - Action: Sand down rough edges and surfaces.

STEP 6 - title: "Apply finish or protective coating"
  - VISUAL: FINISHED ITEM, stained/painted/sealed, EXACT match to master.
  - Action: Apply varnish, paint, or oil.

For each step, the "description" field should describe actions specific to THIS wooden item.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a WOODWORKING PATTERN SHEET for THIS EXACT craft from the reference image.
📷 REFERENCE IMAGE: Finished wooden piece.
${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
📦 CATEGORY: Woodcraft

PATTERN REQUIREMENTS:
1. Show flat pattern pieces with DIMENSIONS clearly marked.
2. Include CUT LINES and grain direction indicators.
3. Show JOINERY details (mortise, tenon, dovetail, etc.) where applicable.
4. Label each piece with dimensions and quantity needed.
5. Include a CUT LIST with all pieces.

OUTPUT FORMAT:
- One organized pattern sheet with all pieces
- Technical drawing style with measurements
- PLAIN WHITE background
- Professional woodworking plan quality
`;
    }
}
