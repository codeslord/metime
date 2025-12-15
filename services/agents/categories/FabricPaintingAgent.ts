import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Fabric Painting Agent - Handles fabric printing and painting projects.
 * Focuses on the rhythmic, meditative nature of brush strokes on fabric.
 */
export class FabricPaintingAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.FABRIC_PAINTING;

    readonly card: AgentCard = {
        name: 'FabricPaintingAgent',
        version: '1.0.0',
        description: 'Specialized agent for fabric painting and printing projects including t-shirts, tote bags, and textiles.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.FABRIC_PAINTING)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality photograph of a beautifully hand-painted fabric item: ${userPrompt}.
Category: Fabric Painting/Printing.
Style:
- Hand-painted fabric art with visible brushwork
- Vibrant fabric paints on natural textile
- Artistic design that shows the handmade quality
- Displayed flat or naturally draped
- Clean, neutral background
View: Top-down or slight angle showing the full painted design.
Lighting: Natural, soft lighting that shows fabric texture and paint colors.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL FABRIC PAINTING TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED painted fabric.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Fabric Painting

CURRENT STEP: "${stepDescription}"
Show ONLY the painting progress for this step.

FABRIC PAINTING MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - PREPARATION: Show fabric laid flat with outline or stencil.
PANEL 2 - BASE COLORS: Show large areas being filled with paint.
PANEL 3 - DETAILS: Show fine details and accents being added.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show brush or applicator on fabric where appropriate
- Use smooth, even paint applications
- Progress from outline to filled design
- Match the colors of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert fabric artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to PAINT this fabric design.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Plain fabric item, Fabric paints (list specific colors), Fabric medium, Brushes, Palette, Stencils or transfer paper, Painter's tape, Iron for heat-setting.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Prepare the fabric and workspace"
  - VISUAL: Clean fabric laid flat, secured and ready.
  - Action: Wash fabric, tape down edges, prepare paint palette.

STEP 2 - title: "Transfer or sketch the design"
  - VISUAL: Faint outline visible on fabric.
  - Action: Sketch, stencil, or transfer the design outline.

STEP 3 - title: "Apply base colors to large areas"
  - VISUAL: Main areas filled with solid base colors.
  - Action: Paint the largest areas with even coverage.

STEP 4 - title: "Add secondary colors and details"
  - VISUAL: Smaller details and accent colors added.
  - Action: Paint details, patterns, and smaller elements.

STEP 5 - title: "Enhance with outlines and highlights"
  - VISUAL: Crisp outlines and dimension added.
  - Action: Add defining lines, shadows, and highlights.

STEP 6 - title: "Heat-set and finish"
  - VISUAL: FINISHED fabric item, colors set, EXACT match to master.
  - Action: Iron to heat-set, remove tape, final touch-ups.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a DESIGN TEMPLATE for this fabric painting project.
📷 REFERENCE IMAGE: Finished painted fabric.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Fabric Painting

TEMPLATE REQUIREMENTS:
1. Show DESIGN OUTLINE - traceable pattern lines.
2. Include COLOR KEY - each paint color with swatches.
3. Show PLACEMENT GUIDE - where design goes on fabric.
4. Include TECHNIQUE TIPS - brush direction, layering order.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Print-ready quality for tracing
`;
    }
}
