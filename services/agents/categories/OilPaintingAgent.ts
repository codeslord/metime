import { AgentCard } from '../../a2a/types';
import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

/**
 * Oil Painting Agent - Handles oil painting projects.
 * Focuses on the rich, meditative nature of oil painting techniques.
 */
export class OilPaintingAgent extends CategoryAgentBase {
  readonly category = ActivityCategory.OIL_PAINTING;

  readonly card: AgentCard = {
    name: 'OilPaintingAgent',
    version: '1.0.0',
    description: 'Specialized agent for oil painting with focus on glazing, impasto, and blending techniques.',
    capabilities: CategoryAgentBase.createCategoryCapabilities(CraftCategory.OIL_PAINTING)
  };

  protected getMasterImagePrompt(userPrompt: string): string {
    return `
Create a high-quality photograph of a beautiful oil painting: ${userPrompt}.
Category: Oil Painting.
Style:
- Traditional oil painting on primed canvas
- Rich, buttery paint texture with visible brushstrokes
- Deep, luminous colors with subtle glazing
- Professional artistic quality
- Classical painting aesthetic
View: Slight angle showing canvas texture and paint impasto.
Lighting: Gallery-style lighting that shows paint dimensionality.
`;
  }

  protected getStepImagePrompt(stepDescription: string, targetObjectLabel?: string): string {
    return `
🎯 YOUR TASK: Generate a MULTI-PANEL OIL PAINTING TUTORIAL.
📷 REFERENCE IMAGE: This is the FINISHED oil painting.
${targetObjectLabel ? `🎨 SUBJECT: ${targetObjectLabel}` : ''}
📦 CATEGORY: Oil Painting

CURRENT STEP: "${stepDescription}"
Show ONLY the painting progress for this step.

OIL PAINTING MULTI-PANEL FORMAT (3-4 PANELS):
PANEL 1 - UNDERPAINTING: Show tonal underpainting on canvas.
PANEL 2 - BLOCKING: Show main shapes blocked in.
PANEL 3 - BUILDING: Show layers being built up.
PANEL 4 - RESULT: Show the completed portion from this step.

STYLE REQUIREMENTS:
- Show brush applying thick paint where appropriate
- Use rich, layered color applications
- Progress from thin underpainting to thick impasto
- Match the color palette of the reference EXACTLY
`;
  }

  protected getDissectionPrompt(userPrompt: string): string {
    return `
You are an expert oil painter analyzing this REFERENCE image: "${userPrompt}".
YOUR TASK: Create 6 INCREMENTAL STEPS that show progressive simplification FROM the reference.

🎯 INCREMENTAL REVEAL APPROACH:
The reference image shows the FINISHED oil painting. Each step removes paint layers to show an earlier stage.
Step 1 = Most simplified (sketch on canvas). Step 6 = Nearly identical to reference.
Users START at Step 1 and work TOWARD the reference image.

1. Determine complexity (Simple, Moderate, Complex) & score 1-10.
2. List materials. You MUST include: Primed canvas, Oil paints (list specific colors), Hog bristle brushes (various sizes), Palette knife, Wooden palette, Linseed oil medium, Turpentine or odorless mineral spirits, Rags, Easel.
3. Break down into EXACTLY 6 INCREMENTAL STEPS.

🚨 MANDATORY 6-STEP INCREMENTAL REVEAL 🚨
You MUST generate EXACTLY 6 steps. The "title" field for each step MUST be EXACTLY as written below:

STEP 1 - title: "Charcoal sketch on primed canvas"
  - VISUAL: Remove ALL paint. Show only composition sketch lines on primed white/toned canvas.
  - This is the starting point - user sees the drawing they'll paint over.

STEP 2 - title: "Monochrome underpainting for values"
  - VISUAL: Remove all color. Show only umber or gray monochrome underpainting establishing lights and darks.
  - User sees the value structure they need to create.

STEP 3 - title: "Flat local colors blocked in"
  - VISUAL: Remove all blending and detail. Show flat color shapes over the underpainting - no modeling.
  - User sees the color map they need to block in.

STEP 4 - title: "Forms modeled with basic values"
  - VISUAL: Remove glazes and fine details. Show colors with basic modeling but lacking rich depth.
  - User sees the mid-stage painting they're working toward.

STEP 5 - title: "Details and impasto nearly complete"
  - VISUAL: Remove only final glazes and finishing. Show well-developed painting missing luminosity and final touches.
  - User sees the nearly complete painting needing only polish.

STEP 6 - title: "Reference image with full depth visible"
  - VISUAL: Show the nearly final result with rich glazing and depth - matching the reference.
  - User sees their goal - the finished oil painting.

Return strict JSON with steps array where each step has "stepNumber", "title" (EXACT), and "description".
`;
  }

  protected getPatternSheetPrompt(craftLabel?: string): string {
    return `
🎯 YOUR TASK: Create a PAINTING REFERENCE for this oil painting.
📷 REFERENCE IMAGE: Finished oil painting.
${craftLabel ? `🎨 SUBJECT: ${craftLabel}` : ''}
📦 CATEGORY: Oil Painting

REFERENCE REQUIREMENTS:
1. Show VALUE STUDY - grayscale version showing light/dark distribution.
2. Include COLOR PALETTE - specific paint colors and mixes.
3. Show COMPOSITION GUIDE - main shapes and focal points.
4. Include TECHNIQUE NOTES - where to use glazing, impasto, blending.
5. Match the style of the reference.

OUTPUT FORMAT:
- One organized reference sheet
- PLAIN WHITE or LIGHT GRAY background
- Clean instructional style
- Professional oil painting tutorial quality
`;
  }
}
