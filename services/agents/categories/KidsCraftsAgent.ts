import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Kids Crafts Agent - Handles all intents for simple children's craft projects.
 * Specializes in simple templates with child-friendly instructions.
 */
export class KidsCraftsAgent extends CategoryAgentBase {
    readonly category = CraftCategory.KIDS_CRAFTS;

    readonly card: AgentCard = {
        name: 'KidsCraftsAgent',
        version: '1.0.0',
        description: 'Specialized agent for simple, child-friendly craft projects.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.KIDS_CRAFTS)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a bright, cheerful photograph of a REAL kids craft project: ${userPrompt}.
Category: Kids Crafts.
Style: 
- Authentic "classroom/home project" look (NOT perfectly polished commercial product)
- Visible cut marks, glue textures, and child-safe materials (felt, construction paper)
- Playful, slightly imperfect assembly typical of children's crafts
- Bright, even lighting on a clean table surface
- Looks achievable and fun
View: Front-facing, eye-level.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for this EASY kids craft.
📷 REFERENCE IMAGE: This is the FINISHED craft.
${targetObjectLabel ? `🎨 CRAFT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Kids Crafts

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

KIDS CRAFTS MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - MATERIALS: Show colorful craft supplies organized in a fun, inviting way.
PANEL 2 - SIMPLE ACTION: Show ONE clear action (cut, glue, fold) with child-sized hands.
PANEL 3 - PROGRESS: Show the piece taking shape.
PANEL 4 - RESULT: Show completed step with encouraging presentation.

CONSISTENCY: Match bright colors and playful style EXACTLY.
Keep instructions visually simple and easy for children to follow.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are a kids craft activity designer analyzing the SPECIFIC kids craft shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact kids craft: "${userPrompt}".
🎯 YOUR TASK: Create SIMPLE step-by-step instructions a child can follow to make THIS EXACT craft as shown.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT shapes, colors, and components visible in THIS craft
- Note the SPECIFIC materials used (paper colors, felt pieces, craft supplies)
- Observe the ACTUAL assembly method and order for THIS design
- Determine how THIS particular craft is put together in a child-friendly way

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List child-safe materials needed for THIS exact craft (specific colors, safety scissors, school glue, construction paper, etc.).
3. Break down THIS SPECIFIC CRAFT into EXACTLY 6 SIMPLE STEPS that progressively build toward the finished piece.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - GATHER SUPPLIES (~15% complete): 
  - VISUAL: Colorful craft supplies organized flat
  - Show paper, scissors, glue in a fun arrangement
  - Nothing cut or assembled yet

STEP 2 - CUT PIECES (~30% complete):
  - VISUAL: Individual pieces cut out and separated
  - All shapes ready for assembly
  - Laid out in order

STEP 3 - START BUILDING (~50% complete):
  - VISUAL: Main base piece with first elements attached
  - Core structure forming
  - Child hands may be visible

STEP 4 - ADD MORE PIECES (~70% complete):
  - VISUAL: Most pieces attached to base
  - Craft recognizable as final project
  - Some details still to add

STEP 5 - ALMOST DONE (~85% complete):
  - VISUAL: Nearly complete craft
  - Final decorations being added
  - Just needs finishing touches

STEP 6 - FINISHED CRAFT (100% complete):
  - VISUAL: EXACTLY match the original image
  - Complete and ready to display
  - Identical to the master reference

For each step, use simple, encouraging language.
Return strict JSON matching the schema.
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a SIMPLE CRAFT TEMPLATE for THIS kids craft from the reference image.
📷 REFERENCE IMAGE: Finished craft.
${craftLabel ? `🎨 CRAFT: ${craftLabel}` : ''}
📦 CATEGORY: Kids Crafts

TEMPLATE REQUIREMENTS:
1. Show simple flat shapes that can be traced or printed.
2. Use BOLD, CLEAR outlines easy for children to cut.
3. Keep pieces LARGE and manageable for small hands.
4. Label pieces with simple names.
5. BRIGHT, FUN colors matching the reference.

OUTPUT FORMAT:
- One organized template sheet
- PLAIN WHITE background
- Large, clear shapes
- Child-friendly and printable quality
`;
    }
}
