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
3. Break down into EXACTLY 4 PROGRESSIVE DRAWING STEPS.

🚨 MANDATORY 4-STEP PROGRESSIVE DRAWING TUTORIAL 🚨

STEP 1 - FOUNDATION (Easiest - 10% complexity):
"Basic Shapes & Guidelines"
- Start with ONLY simple geometric shapes (circles, ovals, rectangles, triangles)
- Draw light construction lines to establish proportions
- Focus on PLACEMENT and SIZE relationships
- NO details yet - just the skeletal framework
- Example description: "Lightly sketch a large oval for the head and a smaller circle for the snout..."

STEP 2 - STRUCTURE (Building up - 30% complexity):
"Connecting & Outlining"
- Connect the basic shapes with smooth contour lines
- Define the main silhouette and form
- Add secondary shapes for features (ears, limbs, etc.)
- Still using light lines that can be adjusted
- Example description: "Connect the head oval to the body with curved neck lines, then outline the ears..."

STEP 3 - DETAILS (More complex - 60% complexity):
"Features & Character"
- Add facial features (eyes, nose, mouth) with proper placement
- Draw textures, patterns, or distinctive features
- Add smaller details within the main forms
- Lines can be more confident now
- Example description: "Draw almond-shaped eyes along the guideline, add the nose triangle, and sketch in the fur texture..."

STEP 4 - FINISHING (Full complexity - 100%):
"Shading & Polish"
- Add shadows and highlights for depth
- Refine all lines to final weight
- Erase construction/guide lines
- Add final details, texture, and atmosphere
- Example description: "Use 4B pencil to add shadows under the chin and ears, blend with paper stump, then add whisker details..."

IMPORTANT: Each step should build upon the previous one. A beginner should be able to follow along by completing each step before moving to the next.

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
