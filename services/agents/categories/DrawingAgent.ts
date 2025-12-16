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
You are an expert drawing instructor analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED drawing. Each step removes detail to show an earlier stage.
Step 1 = Most simplified (gesture lines). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Paper or sketchbook, Pencil, Eraser, Pens or liners (optional), Colored pencils, markers, or paints.
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Faint gesture lines showing placement"
  - VISUAL: Remove ALL detail and shading. Show only the lightest gestural marks for composition.
  - This is the starting point - user sees basic placement guides.

STEP 2 - title: "Basic geometric shapes for structure"
  - VISUAL: Remove all refined lines. Show simple shapes (circles, ovals, boxes) forming the underlying structure.
  - User sees the construction shapes they need to draw.

STEP 3 - title: "Clean contour lines defining edges"
  - VISUAL: Remove all shading. Show only the refined outline with construction shapes erased.
  - User sees the line drawing they need to achieve.

STEP 4 - title: "Core shadows and basic values"
  - VISUAL: Remove highlights and texture. Show basic value structure with main shadows.
  - User sees the shading foundation they're working toward.

STEP 5 - title: "Detailed rendering nearly complete"
  - VISUAL: Remove only final polish (deepest darks, brightest highlights, finest details).
  - User sees the nearly finished drawing needing only final touches.

STEP 6 - title: "Reference image with full rendering"
  - VISUAL: Show the nearly final result with all details - matching the reference drawing.
  - User sees their goal - the finished artwork.

For each step, the "description" field should describe what is VISIBLE at this stage.
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
