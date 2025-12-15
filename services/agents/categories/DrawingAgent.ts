import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Drawing Agent - Handles all intents for drawing/illustration projects.
 * Specializes in step-by-step drawing tutorials and sketching guides.
 */
export class DrawingAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.DRAWING;

  readonly card: AgentCard = {
    name: 'DrawingAgent',
    version: '1.0.0',
    description: 'Specialized agent for drawing and illustration tutorials with step-by-step guides.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.DRAWING)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a high-quality hand-drawn illustration/sketch of: ${userPrompt}.
Category: Drawing/Illustration.
Style: 
- Artistic, hand-drawn aesthetic (NOT a photograph)
- Clean lines, visible pencil/brush strokes
- Artistic composition typical of a professional sketchbook or illustration portfolio
- White or neutral paper background
View: Centered, clear view of the subject.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL DRAWING TUTORIAL for this EXACT subject.
📷 REFERENCE IMAGE: This is the FINISHED drawing.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Drawing Tutorial

CURRENT STEP: "${stepDescription}"
Show ONLY the drawing progress for this step.

DRAWING TUTORIAL MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - BASIC SHAPES: Show simple geometric shapes/guide lines as foundation.
PANEL 2 - OUTLINE: Show pencil adding main outlines over the shapes.
PANEL 3 - DETAILS: Show adding details, features, and refinements.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show a hand holding a pencil where appropriate
- Use light guide lines that would be erased later
- Progress from simple to complex
- Match the style of the reference EXACTLY
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert drawing instructor analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to DRAW this artwork.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Paper or sketchbook, Pencil, Eraser, Pens or liners (optional), Colored pencils, markers, or paints.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Lightly sketch the outline"
  - VISUAL: Very faint, loose gestural lines indicating composition.
  - Action: Lightly map out the overall placement and size.

STEP 2 - title: "Define main shapes and forms"
  - VISUAL: Basic geometric forms (circles, cubes) blocking the subject.
  - Action: Construct the subject using simple 3D shapes.

STEP 3 - title: "Refine line work"
  - VISUAL: Clean contour lines defining the actual subject edges.
  - Action: Darken the correct lines and erase construction guides.

STEP 4 - title: "Add shading or color"
  - VISUAL: Core shadows added or base colors blocked in.
  - Action: Establish the light source and main values/hues.

STEP 5 - title: "Enhance details and contrast"
  - VISUAL: Textures (hair, wood) and deep blacks/highlights added.
  - Action: Add fine details and push the contrast.

STEP 6 - title: "Finalize and clean up the drawing"
  - VISUAL: FINISHED DRAWING, signed, smudge-free, EXACT match to master.
  - Action: Final polish, white highlights, clean up paper.

For each step, the "description" field should describe actions specific to THIS drawing.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a DRAWING REFERENCE GUIDE for this subject.
📷 REFERENCE IMAGE: Finished drawing/illustration.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Drawing Tutorial

REFERENCE GUIDE REQUIREMENTS:
1. Show BASIC SHAPES breakdown - circles, ovals, lines that form the foundation.
2. Include PROPORTION GUIDES - show relative sizes and spacing.
3. Show KEY ANGLES and curves.
4. Include a STEP-BY-STEP mini progression (4 stages from shapes to finished).
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Professional drawing tutorial quality
`;
  }
}
