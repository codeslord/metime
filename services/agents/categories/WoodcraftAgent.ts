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
You are an expert woodworker. Analyze this image of a woodcraft project: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to build THIS wooden piece.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List the essential materials (wood types, hardware, finishes, tools needed).
3. Break down the construction into EXACTLY 4 STEPS.

🚨 MANDATORY 4-STEP WOODCRAFT GROUPING 🚨
STEP 1 - PREPARATION: Wood selection, measuring, marking, initial cuts.
STEP 2 - SHAPING: Detailed cutting, drilling, routing, carving.
STEP 3 - ASSEMBLY: Joining pieces, gluing, clamping, fastening.
STEP 4 - FINISHING: Sanding, staining, sealing, final touches.

Include safety warnings for power tool usage.
Return strict JSON matching the schema.
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
