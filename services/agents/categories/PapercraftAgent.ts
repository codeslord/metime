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
Create a photorealistic studio photograph of a DIY papercraft project: ${userPrompt}.
Category: Papercraft.
Style: 
- Neutral background with soft studio lighting
- Highly detailed textures showing paper fibers, creases, and fold lines
- The object should look tangible, handmade from paper/cardstock
- Show the characteristic paper textures and clean geometric folds
View: Isometric or front-facing, centered.
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
You are an expert papercraft maker. Analyze this image of a papercraft project: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to build THIS papercraft.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List the essential materials (paper types, cardstock weight, tools like scissors, glue, scoring tool).
3. Break down the construction into EXACTLY 4 STEPS grouped by components.

🚨 MANDATORY 4-STEP PAPERCRAFT GROUPING 🚨
STEP 1 - BASE STRUCTURE: Main body/base pieces, core shapes.
STEP 2 - SECONDARY ELEMENTS: Attached components, layered pieces.
STEP 3 - DETAIL WORK: Small details, decorative elements, textures.
STEP 4 - FINISHING: Assembly, joining, final touches.

Include notes about fold directions (mountain/valley folds) where applicable.
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
