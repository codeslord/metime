import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Jewelry Customization Agent - Handles jewelry painting and customization.
 * Focuses on the detailed, meditative work of personal jewelry customization.
 */
export class JewelryCustomizationAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.JEWELRY_CUSTOMIZATION;

    readonly card: AgentCard = {
        name: 'JewelryCustomizationAgent',
        version: '1.0.0',
        description: 'Specialized agent for jewelry customization including hand-painting, enameling, and personalization.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.JEWELRY_CUSTOMIZATION)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality photograph of beautifully customized jewelry: ${userPrompt}.
Category: Jewelry Customization/Painting.
Style:
- Hand-painted or personalized jewelry piece
- Fine detail work on small surface
- Professional quality customization
- Elegant display on neutral background
- Macro photography showing detail
View: Close-up showing the painted or customized details.
Lighting: Soft studio lighting that shows the intricate details.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL JEWELRY CUSTOMIZATION TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED customized jewelry.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Jewelry Customization

CURRENT STEP: "${stepDescription}"
Show ONLY the customization progress for this step.

JEWELRY CUSTOMIZATION MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - PREPARATION: Show clean jewelry piece and materials.
PANEL 2 - BASE WORK: Show base coat or primer being applied.
PANEL 3 - DETAILING: Show design being painted or added.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show fine brush or tool on jewelry surface
- Use precise, delicate strokes for small surfaces
- Progress from prep to detailed finish
- Match the design style of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert jewelry artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to CUSTOMIZE this jewelry piece.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Jewelry piece (to customize), Fine detail brushes (#0, #00), Enamel or acrylic paints (list colors), Jewelry primer, Clear sealant, Magnifying glass or loupe, Cleaning supplies, Toothpicks for detail work.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Clean and prepare the jewelry surface"
  - VISUAL: Clean jewelry piece ready for customization.
  - Action: Clean thoroughly, remove any oils or residue.

STEP 2 - title: "Apply primer or base coat"
  - VISUAL: Thin primer layer on areas to be painted.
  - Action: Apply thin primer coat, let dry completely.

STEP 3 - title: "Paint base colors"
  - VISUAL: Base colors applied to design areas.
  - Action: Apply base color layer with fine brush.

STEP 4 - title: "Add design details"
  - VISUAL: Detailed pattern or design painted on.
  - Action: Paint fine details and patterns carefully.

STEP 5 - title: "Apply accents and highlights"
  - VISUAL: Accent colors and dimensional details added.
  - Action: Add highlights, shadows, and accent colors.

STEP 6 - title: "Seal and finish"
  - VISUAL: FINISHED jewelry, sealed and polished, EXACT match to master.
  - Action: Apply clear sealant, let cure completely.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a DESIGN GUIDE for this jewelry customization.
📷 REFERENCE IMAGE: Finished customized jewelry.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Jewelry Customization

GUIDE REQUIREMENTS:
1. Show DESIGN LAYOUT - pattern scaled to actual jewelry size.
2. Include COLOR PALETTE - specific paint colors used.
3. Show TECHNIQUE GUIDE - brush strokes and application methods.
4. Include MAGNIFIED DETAIL views of complex areas.
5. Match the customization style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Suitable for detailed miniature work
`;
    }
}
