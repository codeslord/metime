import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Tabletop Figures Agent - Handles intents for miniature painting and assembly.
 * Specializes in wargaming miniatures, D&D figures, and scale models.
 */
export class TabletopFiguresAgent extends CategoryAgentBase {
  readonly category = CraftCategory.TABLETOP_FIGURES;

  readonly card: AgentCard = {
    name: 'TabletopFiguresAgent',
    version: '1.0.0',
    description: 'Specialized agent for tabletop miniatures, scale figures, and wargaming models.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.TABLETOP_FIGURES)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a macro photograph of a PAINTED TABLETOP MINIATURE: ${userPrompt}.
Category: Tabletop Figures.
Style: 
- "Eavy Metal" or high-end studio miniature photography style
- Crisp details on 28mm-32mm scale figures
- Professional highlighting, shading, and blending (NMM, osl, glazing)
- Miniature standing on a scenic base
- Sharp focus on the face/focal point, smooth bokeh background
View: Eye-level macro shot relative to the miniature.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL PAINTING GUIDE for this specific miniature.
📷 REFERENCE IMAGE: This is the FINISHED painted figure.
${targetObjectLabel ? `🎨 FIGURE: ${targetObjectLabel}` : ''}
📦 CATEGORY: Tabletop Figures

CURRENT STEP: "${stepDescription}"
Show ONLY the painting stage described.

MINIATURE PAINTING MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - PALETTE: Show the specific paint colors mixed on a wet palette.
PANEL 2 - APPLICATION: Show brush applying paint to the specific area (macro view).
PANEL 3 - TECHNIQUE: Show the specific technique (e.g., drybrushing, washing, layering).
PANEL 4 - RESULT: Show the figure with this step completed.

CONSISTENCY: Match expected technique results (e.g., basecoat is flat, wash settles in recesses).
Show appropriate brush size for the detail level.
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert miniature painter analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to PAINT this miniature.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Miniature figure or modeling material, Sculpting tools, Primer, Acrylic paints, Fine brushes, Sealant.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below (verbatim, no variations):

STEP 1 - title: "Assemble or sculpt the base model"
  - VISUAL: Miniature assembled, mold lines removed, base texture applied.
  - Action: Clean, assemble, and prep the model.

STEP 2 - title: "Secure the figure to its base"
  - VISUAL: Model on painting handle, fully primed (black/grey/white).
  - Action: Apply primer coat for paint adhesion.

STEP 3 - title: "Add detailed features"
  - VISUAL: Solid colors applied to all main areas (blocking in).
  - Action: Apply neat base layers to all distinct parts.

STEP 4 - title: "Prime the figure"
  - VISUAL: Recesses darkened, details popping out (contrast).
  - Action: Apply washes to create depth and shadow.

STEP 5 - title: "Paint layers and highlights"
  - VISUAL: Raised areas lightened, volumetric highlights visible.
  - Action: Re-establish base colors and highlight edges.

STEP 6 - title: "Seal for protection"
  - VISUAL: FINISHED MINI, varnished, rim painted black, EXACT match to master.
  - Action: Seal the model, add tufts/snow to base.

For each step, the "description" field should describe actions specific to THIS miniature.
Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a PAINT SCHEME & ASSEMBLY GUIDE for this miniature.
📷 REFERENCE IMAGE: Finished painted figure.
${craftLabel ? `🎨 FIGURE: ${craftLabel}` : ''}
📦 CATEGORY: Tabletop Figures

GUIDE REQUIREMENTS:
1. Show EXPLODED VIEW of assembly if multi-part.
2. Create a COLOR RECIPE CHART (Base, Wash, Layer, Highlight).
3. Mark key areas for specific techniques (e.g., "OSL here").
4. Show front/back/side reference views if possible.
5. Label details clearly.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE background
- Clean, technical illustration style
- Professional hobby guide quality
`;
  }
}
