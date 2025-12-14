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
You are an expert prop maker and cosplayer. Analyze this image of a costume prop: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to build THIS prop.

1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
2. List essential materials (EVA foam thickness, adhesives, paints, strapping).
3. Break down the construction into EXACTLY 4 STEPS.

🚨 MANDATORY 4-STEP PROP GROUPING 🚨
STEP 1 - PATTERNING: Create templates, transfer to foam, cut base pieces.
STEP 2 - SHAPING: Heat form foam, add bevels, create 3D contours.
STEP 3 - ASSEMBLY: Glue pieces, add straps/mounting, structural reinforcement.
STEP 4 - FINISHING: Prime, paint, weather, add details and final touches.

Include safety notes for heat guns and adhesives.
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
