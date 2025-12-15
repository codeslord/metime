import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Pattern Art Agent - Handles mandala, fractal, zen, and geometric illustration.
 * Focuses on the deeply meditative nature of repetitive pattern creation.
 */
export class PatternArtAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.PATTERN_ART;

    readonly card: AgentCard = {
        name: 'PatternArtAgent',
        version: '1.0.0',
        description: 'Specialized agent for pattern art including mandalas, fractals, zen doodles, and geometric designs.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.PATTERN_ART)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality illustration of intricate pattern art: ${userPrompt}.
Category: Pattern Art (Mandala/Fractal/Zen/Geometric).
Style:
- Hand-drawn aesthetic with precise, repeating patterns
- Intricate linework with symmetrical or organic geometry
- Black ink on white, or rich color palette
- Meditative, flowing design
- Professional illustration quality
View: Flat, centered composition showing the complete pattern.
Background: Clean white or subtle neutral.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL PATTERN ART TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED pattern artwork.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Pattern Art

CURRENT STEP: "${stepDescription}"
Show ONLY the pattern progress for this step.

PATTERN ART MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - STRUCTURE: Show basic geometric framework or guidelines.
PANEL 2 - FOUNDATION: Show primary pattern elements placed.
PANEL 3 - BUILDING: Show additional layers of pattern detail.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show pen or marker creating patterns where appropriate
- Use consistent line weight and spacing
- Progress from structure to intricate detail
- Match the pattern style of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert pattern artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to CREATE this pattern art.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Quality drawing paper, Fine-tip pens (various sizes), Ruler, Compass, Protractor, Pencil, Eraser, Markers or colored pens (if colored).
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Create the geometric framework"
  - VISUAL: Light guidelines showing structure (circles, grid, etc.).
  - Action: Draw light pencil guidelines for symmetry.

STEP 2 - title: "Establish the central pattern"
  - VISUAL: Core pattern or central motif drawn.
  - Action: Begin with center design, work outward.

STEP 3 - title: "Add the first layer of repeating elements"
  - VISUAL: Primary repeating patterns visible.
  - Action: Draw first ring of repeating elements.

STEP 4 - title: "Build complexity with secondary patterns"
  - VISUAL: Additional pattern layers added.
  - Action: Fill spaces with secondary patterns.

STEP 5 - title: "Add fine details and embellishments"
  - VISUAL: Intricate details filling all spaces.
  - Action: Add dots, small shapes, fine lines.

STEP 6 - title: "Finalize and clean up lines"
  - VISUAL: FINISHED pattern art, guidelines erased, EXACT match to master.
  - Action: Erase guidelines, thicken important lines, add color if desired.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a PATTERN BREAKDOWN for this artwork.
📷 REFERENCE IMAGE: Finished pattern art.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Pattern Art

BREAKDOWN REQUIREMENTS:
1. Show STRUCTURAL GRID - the underlying geometric framework.
2. Include ELEMENT LIBRARY - individual repeating motifs isolated.
3. Show BUILD ORDER - which elements to draw first.
4. Include SPACING GUIDE - measurements and proportions.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Suitable for pattern recreation
`;
    }
}
