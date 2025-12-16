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
You are an expert pattern artist analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED pattern art. Each step removes pattern elements to show an earlier stage.
Step 1 = Most simplified (geometric guidelines only). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Quality drawing paper, Fine-tip pens (various sizes), Ruler, Compass, Protractor, Pencil, Eraser, Markers or colored pens (if colored).
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Geometric framework and guidelines"
  - VISUAL: Remove ALL drawn patterns. Show only faint construction lines (circles, grids, guidelines).
  - This is the starting point - user sees the structural foundation.

STEP 2 - title: "Central motif established"
  - VISUAL: Remove all pattern layers except the center. Show only the core central design element.
  - User sees the starting motif they need to draw.

STEP 3 - title: "First ring of repeating elements"
  - VISUAL: Remove secondary patterns. Show center + first layer of repeats (~30% complete).
  - User sees the primary pattern they're building.

STEP 4 - title: "Main pattern structure visible"
  - VISUAL: Remove fine details and fills. Show ~60% of pattern without embellishments.
  - User sees the main structure they're working toward.

STEP 5 - title: "Details and fills nearly complete"
  - VISUAL: Remove only final embellishments. Show nearly complete pattern missing only finest details.
  - User sees the nearly finished pattern needing only polish.

STEP 6 - title: "Reference image with complete pattern"
  - VISUAL: Show the nearly final result - guidelines erased, fully detailed, matching the reference.
  - User sees their goal - the finished pattern art.

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
