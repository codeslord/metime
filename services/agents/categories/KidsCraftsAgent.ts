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
You are a friendly craft teacher analyzing this image: "${userPrompt}".
YOUR TASK: Create easy step-by-step instructions for a KID to make this.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Paper or cardboard, Glue, Crayons/markers/paint, Safety scissors, Stickers or simple embellishments.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Lay out materials and tools"
  - VISUAL: All craft supplies laid out on a clean table.
  - Action: Gather everything we need!

STEP 2 - title: "Assemble the main parts"
  - VISUAL: Big pieces cut out or organized.
  - Action: Prepare the main shapes.

STEP 3 - title: "Attach or glue components"
  - VISUAL: Pieces glued or taped together to form the object.
  - Action: Stick the big parts together.

STEP 4 - title: "Decorate with colors or embellishments"
  - VISUAL: Glitters, stickers, or colors being added.
  - Action: Make it colorful and fun!

STEP 5 - title: "Allow glue or paint to dry"
  - VISUAL: Craft sitting safely to dry; hands off!
  - Action: Let the glue or paint dry completely.

STEP 6 - title: "Display or use the finished craft"
  - VISUAL: FINISHED CRAFT, looking happy and complete, EXACT match to master.
  - Action: Show it off or play with it!

For each step, the "description" field should describe actions specific to THIS kids craft.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
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
