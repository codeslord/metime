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
Create a photorealistic studio photograph of a fun kids craft project: ${userPrompt}.
Category: Kids Crafts.
Style: 
- Bright, cheerful lighting with a clean background
- Colorful and playful appearance
- The craft should look achievable by children with adult supervision
- Show child-safe materials like construction paper, pipe cleaners, googly eyes, pom poms
View: Front-facing, inviting, centered.
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
You are a kids craft activity designer. Analyze this image of a kids craft: "${userPrompt}".
YOUR TASK: Create SIMPLE step-by-step instructions a child can follow.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List child-safe materials (safety scissors, school glue, construction paper, etc.).
3. Break down into EXACTLY 4 SIMPLE STEPS.

🚨 MANDATORY 4-STEP KIDS CRAFT GROUPING 🚨
STEP 1 - GATHER & PREP: Collect materials, cut any basic shapes needed.
STEP 2 - BUILD BASE: Create the main body/structure.
STEP 3 - ADD FEATURES: Attach decorative elements, faces, details.
STEP 4 - FINISHING TOUCHES: Final decorations and cleanup.

Use simple, encouraging language. Mention adult supervision where needed.
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
