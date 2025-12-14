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
You are an expert woodworker analyzing the SPECIFIC woodcraft shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact wooden piece: "${userPrompt}".
🎯 YOUR TASK: Create step-by-step instructions to build THIS EXACT woodcraft as shown in the image.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT shapes, dimensions, and components visible in THIS wooden piece
- Note the SPECIFIC wood type, grain patterns, and finish used
- Observe the ACTUAL joinery methods and construction techniques for THIS design
- Determine how THIS particular piece is structured and assembled

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List the essential materials needed for THIS exact piece (wood types, hardware, finishes, specific tools).
3. Break down the construction of THIS SPECIFIC WOODCRAFT into EXACTLY 6 STEPS that progressively build toward the finished piece.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - RAW MATERIALS (~15% complete): 
  - VISUAL: Individual wood pieces laid flat, NOT assembled
  - Show all cut pieces separated and organized (knolling style)
  - Tools visible beside materials

STEP 2 - INITIAL SHAPING (~30% complete):
  - VISUAL: Pieces being shaped but still separate
  - Show cutting, drilling, or carving in progress
  - Some pieces refined, others still raw

STEP 3 - FIRST ASSEMBLY (~50% complete):
  - VISUAL: Main structure partially assembled
  - Primary pieces joined together
  - Secondary pieces still separate nearby

STEP 4 - MAJOR ASSEMBLY (~70% complete):
  - VISUAL: Most components connected
  - Structure recognizable as the final craft
  - Some finishing work remaining

STEP 5 - DETAILING (~85% complete):
  - VISUAL: Nearly complete assembly
  - Fine details being added
  - Minimal work remaining

STEP 6 - FINISHED CRAFT (100% complete):
  - VISUAL: EXACTLY match the original image
  - Fully polished and finished
  - Identical to the master reference

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
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
