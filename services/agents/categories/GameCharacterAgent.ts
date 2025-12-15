import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Game Character Agent - Handles game character design and illustration.
 * Focuses on the creative expression of character design for games.
 */
export class GameCharacterAgent extends CategoryAgentBase {
    readonly category = ActivityCategory.GAME_CHARACTER;

    readonly card: AgentCard = {
        name: 'GameCharacterAgent',
        version: '1.0.0',
        description: 'Specialized agent for game character design including concept art and character illustration.',
        capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.GAME_CHARACTER)
    };

    protected getMasterImagePrompt(userPrompt: string): string {
        return `
Create a high-quality game character design illustration: ${userPrompt}.
Category: Game Character Design.
Style:
- Professional game art character design
- Clear silhouette and distinctive features
- Dynamic pose or character sheet format
- Rich colors and strong stylization
- Suitable for games (mobile, RPG, action, etc.)
View: Full body or character sheet with front/side views.
Background: Clean gradient or simple environment.
`;
    }

    protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
        return `
🎯 YOUR TASK: Generate a MULTI-PANEL CHARACTER DESIGN TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED character design.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Game Character Design

CURRENT STEP: "${stepDescription}"
Show ONLY the design progress for this step.

CHARACTER DESIGN MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - THUMBNAIL: Show rough gesture/silhouette sketches.
PANEL 2 - STRUCTURE: Show basic anatomy and proportions.
PANEL 3 - REFINEMENT: Show detailed linework and features.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show digital stylus or pencil creating design
- Use clear, confident linework
- Progress from loose sketches to polished design
- Match the character style of the reference EXACTLY
`;
    }

    protected getDissectionPrompt(userPrompt: string): string {
        return `
You are an expert game character artist analyzing this image: "${userPrompt}".
YOUR TASK: Create step-by-step instructions to DESIGN this character.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Sketchbook or digital tablet, Pencils or stylus, Drawing software (if digital), Reference images, Color palette swatches, Character design references.
3. Break down into EXACTLY 6 PROGRESSIVE STEPS.

🚨 MANDATORY 6-STEP PROGRESSION 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Gather references and ideate concepts"
  - VISUAL: Mood board or reference collection.
  - Action: Collect visual references, sketch quick thumbnails.

STEP 2 - title: "Establish silhouette and proportions"
  - VISUAL: Basic shape language and body proportions.
  - Action: Define distinctive silhouette, establish proportions.

STEP 3 - title: "Develop the rough sketch"
  - VISUAL: Loose sketch with main features visible.
  - Action: Sketch face, body, costume elements loosely.

STEP 4 - title: "Refine linework and details"
  - VISUAL: Clean linework with costume and feature details.
  - Action: Clean up lines, add costume details, accessories.

STEP 5 - title: "Add base colors and shading"
  - VISUAL: Flat colors and basic shading applied.
  - Action: Apply color palette, establish lighting direction.

STEP 6 - title: "Polish with final rendering"
  - VISUAL: FINISHED character design, fully rendered, EXACT match to master.
  - Action: Add highlights, textures, final polish.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
    }

    protected getPatternSheetPrompt(craftLabel?: string): string {
        return `
🎯 YOUR TASK: Create a CHARACTER DESIGN SHEET for this character.
📷 REFERENCE IMAGE: Finished character design.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Game Character Design

SHEET REQUIREMENTS:
1. Show CHARACTER TURNAROUND - front, side, back views.
2. Include COLOR PALETTE - exact colors used for skin, costume, etc.
3. Show EXPRESSION SHEET - key facial expressions.
4. Include PROP/ACCESSORY callouts - detailed views of items.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized character sheet
- PLAIN WHITE or LIGHT GRAY background
- Professional game art style
- Suitable for production reference
`;
    }
}
