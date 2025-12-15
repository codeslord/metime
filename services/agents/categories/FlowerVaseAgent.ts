import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Flower Vase Agent - Handles flower vase customization and painting.
 * Focuses on calming floral themes and nature-inspired designs.
 */
export class FlowerVaseAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.FLOWER_VASE;

    readonly card: AgentCard = {
        name: 'FlowerVaseAgent',
        version: '1.0.0',
        description: 'Specialized agent for flower vase customization including hand-painting and decoupage.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.FLOWER_VASE)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality photograph of a beautifully customized flower vase: ${userPrompt}.
Category: Flower Vase Customization.
Style:
- Hand-painted or decorated ceramic/glass vase
- Elegant floral or nature-inspired design
- Professional quality decorative finish
- Displayed on a simple surface
- Soft, natural lighting background
View: Three-quarter angle showing the vase shape and painted design.
Lighting: Soft, diffused lighting that highlights the painted details.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL VASE CUSTOMIZATION TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED decorated vase.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Flower Vase Customization

CURRENT STEP: "${stepDescription}"
Show ONLY the decoration progress for this step.

VASE CUSTOMIZATION MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - PREPARATION: Show clean vase and materials.
PANEL 2 - BASE DESIGN: Show base coat or pattern being applied.
PANEL 3 - DETAILS: Show fine details and accents.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show brush or applicator on vase surface where appropriate
- Use smooth, curved strokes following vase shape
- Progress from base to detailed decoration
- Match the design style of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert decorative artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to DECORATE this vase.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Plain ceramic or glass vase, Acrylic or enamel paints (list colors), Fine brushes, Palette, Painter's tape, Rubbing alcohol (for prep), Clear sealant.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Clean and prepare the vase surface"
  - VISUAL: Clean, plain vase ready for painting.
  - Action: Wipe with alcohol, let dry completely.

STEP 2 - title: "Apply base coat or background color"
  - VISUAL: Vase with base color layer.
  - Action: Apply even base coat, allow to dry.

STEP 3 - title: "Sketch or transfer the design"
  - VISUAL: Faint outline of design visible.
  - Action: Lightly sketch design or use transfer method.

STEP 4 - title: "Paint main design elements"
  - VISUAL: Primary design painted on vase.
  - Action: Paint the main floral or decorative elements.

STEP 5 - title: "Add details and accents"
  - VISUAL: Fine details, highlights, and accents added.
  - Action: Paint small details, add dimension and interest.

STEP 6 - title: "Seal and finish"
  - VISUAL: FINISHED vase, sealed and polished, EXACT match to master.
  - Action: Apply clear sealant, let cure completely.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a DESIGN TEMPLATE for this vase decoration.
📷 REFERENCE IMAGE: Finished decorated vase.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Flower Vase Customization

TEMPLATE REQUIREMENTS:
1. Show UNWRAPPED DESIGN - pattern flattened for reference.
2. Include COLOR PALETTE - each paint color with swatches.
3. Show PLACEMENT GUIDE - where elements go on vase shape.
4. Include BRUSH TECHNIQUE tips - curved strokes for vase form.
5. Match the decorative style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Traceable pattern quality
`;
    }
}
