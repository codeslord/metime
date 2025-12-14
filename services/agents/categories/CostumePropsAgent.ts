import { AgentCard } from '../../a2a/types';
import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Costume Props Agent - Handles all intents for costume and prop making.
 * Specializes in foam armor patterns and wearable craft templates.
 */
export class CostumePropsAgent extends CategoryAgentBase {
    readonly category = CraftCategory.COSTUME_PROPS;

    readonly card: AgentCard = {
        name: 'CostumePropsAgent',
        version: '1.0.0',
        description: 'Specialized agent for costume and prop making including foam armor, wearables, and cosplay.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.COSTUME_PROPS)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a photorealistic photograph of a REAL physical costume prop: ${userPrompt}.
Category: Costume & Props.
Style: 
- Authentic physical prop photography (NOT CGI/Game Asset)
- Visible texture of EVA foam, thermoplastics, or fabric
- Real paint application with weathering, brush strokes, and dry brushing
- Natural lighting revealing surface imperfections and material behavior
- Looks like a finished project from a workshop
View: Dynamic angle showcasing the prop's physical construction.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL INSTRUCTION IMAGE for building this EXACT costume prop.
📷 REFERENCE IMAGE: This is the FINISHED prop/armor piece.
${targetObjectLabel ? `🎨 PROP: ${targetObjectLabel}` : ''}
📦 CATEGORY: Costume & Props

CURRENT STEP: "${stepDescription}"
Show ONLY the components mentioned in this step.

COSTUME PROPS MULTI-PANEL FORMAT (2-4 PANELS):
PANEL 1 - MATERIALS (KNOLLING): Show foam sheets, tools, reference patterns laid flat.
PANEL 2 - CUTTING/SHAPING: Show pieces being cut, heat-formed, or shaped.
PANEL 3 - ASSEMBLY: Show pieces being glued, joined, or strapped together.
PANEL 4 - RESULT: Show completed component from this step.

CONSISTENCY: Match colors, weathering, and scale EXACTLY.
Show heat gun usage, contact cement application where applicable.
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert prop maker and cosplayer analyzing the SPECIFIC costume prop shown in this image.

📷 IMAGE ANALYSIS: Carefully examine THIS exact prop: "${userPrompt}".
🎯 YOUR TASK: Create step-by-step instructions to build THIS EXACT prop as shown in the image.

CRITICAL - ANALYZE THE SPECIFIC DESIGN:
- Identify the EXACT shapes, dimensions, and components visible in THIS prop
- Note the SPECIFIC materials, colors, and weathering effects used
- Observe the ACTUAL construction method and assembly technique for THIS design
- Determine how THIS particular prop is structured and built

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10 based on THIS specific design.
2. List essential materials needed for THIS exact prop (EVA foam thickness, specific adhesives, paint colors, strapping).
3. Break down the construction of THIS SPECIFIC PROP into EXACTLY 6 STEPS that progressively build toward the finished piece.

🚨 MANDATORY 6-STEP PROGRESSIVE CONSTRUCTION 🚨
Each step describes what the IMAGE should show at that stage of completion:

STEP 1 - MATERIALS & PATTERNS (~15% complete): 
  - VISUAL: Foam sheets with traced patterns, NOT cut yet
  - Show materials organized flat (knolling style)
  - Tools and patterns visible beside materials

STEP 2 - CUT PIECES (~30% complete):
  - VISUAL: Individual foam pieces cut out and separated
  - All pieces flat, not heat-formed yet
  - Bevels may be cut but not shaped

STEP 3 - SHAPED PIECES (~50% complete):
  - VISUAL: Pieces heat-formed to 3D contours
  - Individual pieces shaped but not assembled
  - Ready for gluing

STEP 4 - INITIAL ASSEMBLY (~70% complete):
  - VISUAL: Main pieces glued together
  - Core structure formed
  - Secondary pieces nearby

STEP 5 - PRIMED & DETAILED (~85% complete):
  - VISUAL: Assembled and primed
  - Base painting started
  - Details being added

STEP 6 - FINISHED PROP (100% complete):
  - VISUAL: EXACTLY match the original image
  - Fully painted and weathered
  - Identical to the master reference

For each step, focus on describing what the IMAGE should LOOK LIKE at that stage.
Return strict JSON matching the schema.
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a FOAM ARMOR/PROP PATTERN TEMPLATE for THIS EXACT piece from the reference image.
📷 REFERENCE IMAGE: Finished prop or armor piece.
${craftLabel ? `🎨 PROP: ${craftLabel}` : ''}
📦 CATEGORY: Costume & Props

PATTERN REQUIREMENTS:
1. Show flat foam pattern pieces that can be traced and cut.
2. Include bevel direction indicators (< for cuts angled inward).
3. Mark foam THICKNESS for each piece (2mm, 4mm, 6mm, 10mm).
4. Show fold lines and heat-forming areas.
5. Include strap/mounting attachment points.
6. Scale reference for sizing to body.

OUTPUT FORMAT:
- One organized pattern sheet with all pieces
- PLAIN WHITE background
- Technical drawing style with measurements
- Professional foam crafting pattern quality
`;
    }
}
