import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Jewelry Customization Agent - Handles jewelry painting and customization.
 * Focuses on the detailed, meditative work of personal jewelry customization.
 */
export class JewelryCustomizationAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.JEWELRY_CUSTOMIZATION;

  readonly card: AgentCard = {
    name: 'JewelryCustomizationAgent',
    version: '1.0.0',
    description: 'Specialized agent for jewelry customization including hand-painting, enameling, and personalization.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.JEWELRY_CUSTOMIZATION)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a high-quality photograph of beautifully customized jewelry: ${userPrompt}.
Category: Jewelry Customization/Painting.
Style:
- Hand-painted or personalized jewelry piece
- Fine detail work on small surface
- Professional quality customization
- Elegant display on neutral background
- Macro photography showing detail
View: Close-up showing the painted or customized details.
Lighting: Soft studio lighting that shows the intricate details.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL JEWELRY CUSTOMIZATION TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED customized jewelry.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Jewelry Customization

CURRENT STEP: "${stepDescription}"
Show ONLY the customization progress for this step.

JEWELRY CUSTOMIZATION MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - PREPARATION: Show clean jewelry piece and materials.
PANEL 2 - BASE WORK: Show base coat or primer being applied.
PANEL 3 - DETAILING: Show design being painted or added.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show fine brush or tool on jewelry surface
- Use precise, delicate strokes for small surfaces
- Progress from prep to detailed finish
- Match the design style of the reference EXACTLY
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert jewelry artist analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED customized jewelry. Each step removes decoration to show an earlier stage.
Step 1 = Most simplified (plain jewelry). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

CRITICAL INSTRUCTION - CUSTOMIZATION ONLY:
- The 'description' for each step must focus ONLY on customizing, painting, or setting the jewelry piece.
- DO NOT describe metalworking, casting, soldering, or manufacturing the base piece.
- Assume the user has the plain jewelry piece ready to customize.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Jewelry piece (to customize), Fine detail brushes (#0, #00), Enamel or acrylic paints (list colors), Jewelry primer, Clear sealant, Magnifying glass or loupe, Cleaning supplies, Toothpicks for detail work.
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Plain jewelry piece uncustomized"
  - VISUAL: Remove ALL customization. Show the original plain jewelry surface.
  - DESCRIPTION CONSTRAINT: Describe prepping the plain piece. Do NOT say "Cast the ring".

STEP 2 - title: "Primed and ready for painting"
  - VISUAL: Remove all color. Show jewelry with primer applied to customization areas.
  - DESCRIPTION CONSTRAINT: Describe applying primer to area.

STEP 3 - title: "Base colors applied to design areas"
  - VISUAL: Remove all detail work. Show flat base colors on painted areas.
  - DESCRIPTION CONSTRAINT: Describe applying base colors.

STEP 4 - title: "Pattern and details painted"
  - VISUAL: Remove accents and dimension. Show base pattern painted but lacking polish.
  - DESCRIPTION CONSTRAINT: Describe painting the pattern.

STEP 5 - title: "Accents and dimension nearly complete"
  - VISUAL: Remove final polish and sealing. Show nearly complete customization.
  - DESCRIPTION CONSTRAINT: Describe adding details and accents.

STEP 6 - title: "Reference image with complete customization"
  - VISUAL: Show the nearly final result - sealed and polished, matching the reference.
  - DESCRIPTION CONSTRAINT: Describe final touches and sealant.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a DESIGN GUIDE for this jewelry customization.
📷 REFERENCE IMAGE: Finished customized jewelry.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Jewelry Customization

GUIDE REQUIREMENTS:
1. Show DESIGN LAYOUT - pattern scaled to actual jewelry size.
2. Include COLOR PALETTE - specific paint colors used.
3. Show TECHNIQUE GUIDE - brush strokes and application methods.
4. Include MAGNIFIED DETAIL views of complex areas.
5. Match the customization style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Suitable for detailed miniature work
`;
  }
}
