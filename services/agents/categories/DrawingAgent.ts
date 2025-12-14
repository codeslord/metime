import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Drawing Agent - Handles all intents for drawing/illustration projects.
 * Specializes in step-by-step drawing tutorials and sketching guides.
 */
export class DrawingAgent extends CategoryAgentBase {
    readonly category = CraftCategory.DRAWING;

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
You are an expert drawing instructor creating a beginner-friendly tutorial. Analyze this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to DRAW this subject from scratch, with GRADUALLY INCREASING COMPLEXITY.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List the essential materials (pencil grades like 2H, HB, 2B, 4B; paper type; eraser; optional: colors).
3. Break down into EXACTLY 6 PROGRESSIVE DRAWING STEPS.

🚨 MANDATORY 6-STEP PROGRESSIVE DRAWING TUTORIAL 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - BASIC SHAPES (~15% complete):
  - VISUAL: Only simple geometric shapes (circles, ovals, rectangles)
  - Light construction lines for proportions
  - Guide marks and alignment lines
  - NO details yet - just the skeletal framework

STEP 2 - CONNECTING SHAPES (~30% complete):
  - VISUAL: Shapes connected with smooth contour lines
  - Main silhouette becoming visible
  - Still using light pencil lines
  - Secondary shapes for major features added

STEP 3 - MAIN FEATURES (~50% complete):
  - VISUAL: Primary features drawn (eyes, major elements)
  - Contour lines refined
  - Basic proportions established
  - Ready for detail work

STEP 4 - DETAILS (~70% complete):
  - VISUAL: Detailed features added
  - Textures and patterns emerging
  - Lines becoming more confident
  - Recognizable as the subject

STEP 5 - REFINEMENT (~85% complete):
  - VISUAL: Nearly complete drawing
  - Fine details and textures added
  - Initial shading started
  - Construction lines being erased

STEP 6 - FINISHED DRAWING (100% complete):
  - VISUAL: EXACTLY match the original image
  - Full shading and highlights
  - All details complete
  - Polished final artwork

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
Each step should build upon the previous one.
Return strict JSON matching the schema.
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
