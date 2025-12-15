import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Watercolor Agent - Handles watercolor painting projects.
 * Focuses on the flowing, meditative nature of watercolor techniques.
 */
export class WatercolorAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.WATERCOLOR;

    readonly card: AgentCard = {
        name: 'WatercolorAgent',
        version: '1.0.0',
        description: 'Specialized agent for watercolor painting with focus on wet-on-wet, blending, and wash techniques.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.WATERCOLOR)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality photograph of a beautiful watercolor painting: ${userPrompt}.
Category: Watercolor Painting.
Style:
- Traditional watercolor on quality paper
- Soft, flowing washes with visible pigment granulation
- Transparent layers and gentle color blending
- Visible paper texture through paint
- Artistic, handmade aesthetic
View: Flat, top-down view of the painting on a clean surface.
Lighting: Natural lighting that shows the watercolor translucency.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL WATERCOLOR PAINTING TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED watercolor painting.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Watercolor Painting

CURRENT STEP: "${stepDescription}"
Show ONLY the painting progress for this step.

WATERCOLOR MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - SKETCH: Show light pencil sketch on paper.
PANEL 2 - FIRST WASH: Show initial wet washes being applied.
PANEL 3 - BUILDING: Show secondary layers and details.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show brush and water where appropriate
- Use soft, wet edges characteristic of watercolor
- Progress from light washes to detailed layers
- Match the color palette of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert watercolor artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to PAINT this watercolor.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Watercolor paper (cold press), Watercolor paints (list specific colors), Round brushes (various sizes), Flat wash brush, Water containers (2), Paper towels, Masking tape, Palette.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Prepare paper and sketch lightly"
  - VISUAL: Taped paper with very light pencil sketch.
  - Action: Tape paper down, sketch subject lightly.

STEP 2 - title: "Apply initial washes for background"
  - VISUAL: Soft background wash visible.
  - Action: Wet paper, apply light background washes.

STEP 3 - title: "Build up main shapes with color"
  - VISUAL: Primary shapes blocked in with base colors.
  - Action: Apply base colors to main elements while wet.

STEP 4 - title: "Add depth with secondary layers"
  - VISUAL: More saturated areas and shadows added.
  - Action: Layer colors for depth, let layers dry between.

STEP 5 - title: "Paint fine details and accents"
  - VISUAL: Details and small elements added.
  - Action: Use fine brush for details when paper is dry.

STEP 6 - title: "Final touches and remove tape"
  - VISUAL: FINISHED painting, tape removed, EXACT match to master.
  - Action: Add final highlights, let dry, carefully remove tape.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a PAINTING GUIDE for this watercolor.
📷 REFERENCE IMAGE: Finished watercolor painting.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Watercolor Painting

GUIDE REQUIREMENTS:
1. Show SKETCH OUTLINE - traceable line drawing.
2. Include COLOR MIXING GUIDE - paint colors and mixes used.
3. Show WASH ORDER - which areas to paint first.
4. Include TECHNIQUE NOTES - wet-on-wet vs dry brush areas.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Suitable for beginner watercolorists
`;
    }
}
