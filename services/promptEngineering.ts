import { getAiClient, retryWithBackoff } from "./aiUtils";
import { StructuredPrompt, AestheticControl, ConsistentContext } from "./briaTypes";
import { CraftCategory } from "../types";
import { Type } from "@google/genai";

/**
 * Service to handle VLM (Vision Language Model) tasks for Bria FIBO.
 * Converts natural language implementation details into structured JSON prompts.
 */
export class PromptEngineeringService {

    /**
     * Default aesthetics to use if Gemini fails to generate them.
     */
    private static readonly DEFAULT_AESTHETICS: AestheticControl = {
        composition: "centered, well-balanced, clean",
        color_scheme: "natural, warm tones with neutral background",
        mood_atmosphere: "professional, instructional, clear"
    };

    /**
     * Ensures the aesthetics field is present and complete in the structured prompt.
     */
    private static ensureAestheticsField(prompt: StructuredPrompt): StructuredPrompt {
        if (!prompt.aesthetics) {
            console.warn('Aesthetics field missing from Gemini response, using defaults');
            prompt.aesthetics = { ...this.DEFAULT_AESTHETICS };
        } else {
            // Ensure all required sub-fields are present
            if (!prompt.aesthetics.composition) {
                prompt.aesthetics.composition = this.DEFAULT_AESTHETICS.composition;
            }
            if (!prompt.aesthetics.color_scheme) {
                prompt.aesthetics.color_scheme = this.DEFAULT_AESTHETICS.color_scheme;
            }
            if (!prompt.aesthetics.mood_atmosphere) {
                prompt.aesthetics.mood_atmosphere = this.DEFAULT_AESTHETICS.mood_atmosphere;
            }
        }
        return prompt;
    }

    /**
     * Converts a user's text prompt into a detailed Bria Structured Prompt for a Master Image.
     */
    static async createMasterPrompt(userPrompt: string, category: CraftCategory): Promise<StructuredPrompt> {
        const ai = getAiClient();

        const systemInstruction = `
You are an expert art director and prompt engineer for Bria FIBO, a JSON-native text-to-image model.
Your goal is to convert a user's creative activity idea into a detailed, photorealistic Structured Prompt.

CATEGORY: ${category}
USER PROMPT: "${userPrompt}"

REQUIREMENTS:
1. Create a detailed scene description suitable for a finished mindful creative activity.
2. The image MUST be photorealistic, showing the finished object.
3. Use high-quality lighting (studio or natural) and appropriate aesthetics for the category.
4. Ensure the background is neutral but textured (e.g., wooden table, cutting mat) to emphasize the creation.
5. Return ONLY the JSON object matching the Bria StructuredPrompt schema.
`;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: systemInstruction }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            short_description: { type: Type.STRING },
                            objects: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        location: { type: Type.STRING },
                                        relationship: { type: Type.STRING },
                                        relative_size: { type: Type.STRING },
                                        shape_and_color: { type: Type.STRING },
                                        texture: { type: Type.STRING },
                                        number_of_objects: { type: Type.NUMBER }
                                    },
                                    required: ["description", "relationship"]
                                }
                            },
                            background_setting: { type: Type.STRING },
                            lighting: {
                                type: Type.OBJECT,
                                properties: {
                                    conditions: { type: Type.STRING },
                                    direction: { type: Type.STRING },
                                    shadows: { type: Type.STRING }
                                },
                                required: ["conditions", "direction", "shadows"]
                            },
                            aesthetics: {
                                type: Type.OBJECT,
                                properties: {
                                    composition: { type: Type.STRING },
                                    color_scheme: { type: Type.STRING },
                                    mood_atmosphere: { type: Type.STRING }
                                },
                                required: ["composition", "color_scheme", "mood_atmosphere"]
                            },
                            photographic_characteristics: {
                                type: Type.OBJECT,
                                properties: {
                                    camera_angle: { type: Type.STRING },
                                    depth_of_field: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    lens_focal_length: { type: Type.STRING }
                                },
                                required: ["camera_angle", "depth_of_field", "focus", "lens_focal_length"]
                            },
                            style_medium: { type: Type.STRING },
                            context: { type: Type.STRING } // Added context field
                        },
                        required: ["short_description", "objects", "style_medium", "aesthetics", "context"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from prompt engineering");
            const prompt = JSON.parse(text) as StructuredPrompt;
            return this.ensureAestheticsField(prompt);
        });
    }

    /**
     * Modifies a base structured prompt (from a master image) to visualize a specific step.
     * CRITICAL: Each step must show progressive construction of the EXACT craft from the master image.
     */
    static async adaptPromptForStep(
        basePrompt: StructuredPrompt,
        stepDescription: string,
        category: CraftCategory
    ): Promise<StructuredPrompt> {
        const ai = getAiClient();

        const systemInstruction = `
You are an expert technical illustrator creating step-by-step instructions for building the EXACT craft shown in the Master Prompt.

📷 MASTER PROMPT: Describes the FINISHED craft that we are building toward.
🎯 CURRENT STEP: "${stepDescription}"
📦 CATEGORY: ${category}

CRITICAL RULES - BUILDING THE EXACT CRAFT:
1. **EXACT MATCH**: This step must show components that will become part of the EXACT craft in the Master Prompt.
   - Match the SAME shapes, proportions, and design elements
   - Match the SAME colors, materials, and textures
   - Match the SAME style and aesthetic direction

2. **PROGRESSIVE CONSTRUCTION**: Show this step as a stage in building toward the finished craft.
   - If this is step 1: Show the foundational components in their raw/prepared state
   - If this is step 2-3: Show intermediate assembly with some components already combined
   - If this is step 4: Show near-completion with final details being added

3. **COMPONENT ISOLATION**: Show ONLY what's relevant for THIS specific step.
   - Remove components that haven't been introduced yet
   - Keep components from previous steps visible if they're being built upon
   - Use "knolling" layout (flat organized view) for material prep steps
   - Use "action shot" (hands working) for assembly/construction steps

4. **VISUAL CONSISTENCY**: Maintain exact visual continuity with the Master Prompt.
   - Same color palette and material appearance
   - Same lighting quality (bright, clear, instructional)
   - Clean white or neutral background for clarity
   - Same photographic style (realistic, tangible, handmade)

5. **SPATIAL ACCURACY**: If the Master Prompt shows specific orientations or arrangements, maintain those.
   - Match the viewing angle for recognizability
   - Show components in positions that make sense for the final assembly

TASK: Modify the Master Prompt JSON to show THIS SPECIFIC STEP while maintaining exact visual consistency with the finished craft.
`;

        const promptText = `
MASTER PROMPT JSON:
${JSON.stringify(basePrompt, null, 2)}

INSTRUCTIONS: 
${systemInstruction}
`;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: promptText }] },
                config: {
                    responseMimeType: "application/json",
                    // Reuse schema structure implicitly or rely on the strong context + JSON mode
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            short_description: { type: Type.STRING },
                            objects: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        location: { type: Type.STRING },
                                        relationship: { type: Type.STRING },
                                        relative_size: { type: Type.STRING },
                                        shape_and_color: { type: Type.STRING },
                                        texture: { type: Type.STRING },
                                        number_of_objects: { type: Type.NUMBER },
                                        action: { type: Type.STRING } // Added action for step shots
                                    },
                                    required: ["description", "relationship"]
                                }
                            },
                            background_setting: { type: Type.STRING },
                            lighting: {
                                type: Type.OBJECT,
                                properties: {
                                    conditions: { type: Type.STRING },
                                    direction: { type: Type.STRING },
                                    shadows: { type: Type.STRING }
                                },
                                required: ["conditions", "direction", "shadows"]
                            },
                            photographic_characteristics: {
                                type: Type.OBJECT,
                                properties: {
                                    camera_angle: { type: Type.STRING },
                                    depth_of_field: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    lens_focal_length: { type: Type.STRING }
                                },
                                required: ["camera_angle", "depth_of_field", "focus", "lens_focal_length"]
                            },
                            aesthetics: {
                                type: Type.OBJECT,
                                properties: {
                                    composition: { type: Type.STRING },
                                    color_scheme: { type: Type.STRING },
                                    mood_atmosphere: { type: Type.STRING }
                                },
                                required: ["composition", "color_scheme", "mood_atmosphere"]
                            },
                            style_medium: { type: Type.STRING },
                            context: { type: Type.STRING } // Added context field
                        },
                        required: ["short_description", "objects", "style_medium", "aesthetics", "context"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from step adaptation");
            const prompt = JSON.parse(text) as StructuredPrompt;
            return this.ensureAestheticsField(prompt);
        });
    }

    /**
     * INCREMENTAL REVEAL: Each step progressively REMOVES details from the master image.
     * 
     * Key behavior:
     * - Step 1: Shows the most simplified version (most details removed from master)
     * - Each subsequent step adds back more details from the master
     * - Step 6: Shows nearly identical to master with only minor differences
     * - All steps are independent and can be generated in parallel
     * 
     * This creates an "incremental learning path" where users start from simplest form
     * and work toward the final reference image.
     * 
     * @param masterPrompt The master image's structured prompt (THE REFERENCE)
     * @param stepDescription What this step should show
     * @param stepNumber Current step (1-indexed)
     * @param totalSteps Total number of steps
     * @param category Activity category for context
     */
    static async refineStructuredPrompt(
        masterPrompt: StructuredPrompt,
        stepDescription: string,
        stepNumber: number,
        totalSteps: number,
        category: CraftCategory
    ): Promise<StructuredPrompt> {
        const ai = getAiClient();

        // REVERSE LOGIC: Step 1 removes most (shows ~17% of details), Step 6 shows ~100%
        const detailPercent = Math.round((stepNumber / totalSteps) * 100);
        const removalPercent = 100 - detailPercent; // How much to remove from master

        // Category-specific detail removal instructions
        const categoryRemovalInstructions: Record<string, { step1: string; step2: string; step3: string; step4: string; step5: string; step6: string }> = {
            [CraftCategory.MINIATURE_PAINTING]: {
                step1: "Remove ALL paint and colors. Show ONLY the bare unpainted clay/resin form of the miniature. No primer, no colors, just the raw sculpted shape with natural material color (gray clay, tan resin, etc.).",
                step2: "Remove all feature colors and details. Show the miniature with ONLY primer/base coat applied - uniform single color (white, gray, or black primer) covering the entire figure. No painted features yet.",
                step3: "Remove all shading, highlighting, and detail work. Show ONLY flat base colors blocked in on major areas (skin tone, armor color, cloth color) - no blending, no shadows, no highlights.",
                step4: "Remove varnish/gloss, fine details, and extreme highlights. Show the miniature with base colors AND basic shading/washes applied - recesses are darker, but highlights and fine details are missing.",
                step5: "Remove ONLY finishing touches - final highlights, eye details, extreme edge highlighting, weathering effects. The miniature looks nearly complete but lacks the final 'pop'.",
                step6: "Show the reference image with all details intact - this is the nearly final result that matches the master, possibly missing only minor finishing touches like basing materials."
            },
            [CraftCategory.WATERCOLOR]: {
                step1: "Remove ALL color from the painting. Show ONLY a light pencil sketch outline on white watercolor paper - no paint whatsoever, just the drawing guide.",
                step2: "Remove all color layers except the very first wash. Show the sketch with ONLY a single light background wash in one color - the palest, most diluted first layer.",
                step3: "Remove all detail layers. Show first washes applied to ALL major areas - each area has only its lightest base color, no layering or depth yet.",
                step4: "Remove the 3rd and 4th color layers. Show the painting with 2 layers of washes - base colors plus one layer of building depth, but missing the rich saturated layers.",
                step5: "Remove fine details and final touches. Show most color layers applied with good depth, but missing the crisp details, darkest darks, and brightest highlights.",
                step6: "Show the nearly complete watercolor with all layers - only missing final finishing touches like signature, tiny highlights, or subtle adjustments."
            },
            [CraftCategory.OIL_PAINTING]: {
                step1: "Remove ALL paint. Show ONLY a charcoal or thin paint sketch on primed canvas - just the composition lines, no color, no underpainting.",
                step2: "Remove all color. Show ONLY a monochrome underpainting (umber or gray tones) establishing values - no actual colors yet.",
                step3: "Remove all detail and blending. Show flat local colors blocked in over the underpainting - no modeling, no highlights, no shadows, just flat color shapes.",
                step4: "Remove glazes and fine details. Show colors with basic modeling - forms have dimension but lack the rich depth of glazes and detailed brushwork.",
                step5: "Remove final glazes, highlights, and impasto details. Show a well-developed painting missing only the final luminous glazes and textural highlights.",
                step6: "Show the nearly complete oil painting with rich depth - only missing final touches like signature and minor adjustments."
            },
            [CraftCategory.DRAWING]: {
                step1: "Remove ALL detail and shading. Show ONLY the lightest gestural marks indicating basic placement and size - barely visible construction lines.",
                step2: "Remove all line refinement and shading. Show basic geometric shapes (circles, ovals, boxes) that form the underlying structure - no actual subject lines yet.",
                step3: "Remove all shading and detail. Show clean contour lines defining the subject's actual edges - construction shapes erased, but no rendering.",
                step4: "Remove highlights and texture. Show the drawing with core shadows and basic value structure - forms read as 3D but lack refinement.",
                step5: "Remove final details and polish. Show nearly complete rendering missing only the crispest details, deepest darks, and brightest highlights.",
                step6: "Show the nearly finished drawing - all major work complete, missing only signature and minor cleanup."
            },
            [CraftCategory.COLORING_BOOK]: {
                step1: "Remove ALL color. Show ONLY the original black and white line art - pure outlines on white paper, completely uncolored.",
                step2: "Remove all coloring except the largest background area. Show the line art with ONLY the main background section lightly colored.",
                step3: "Remove coloring from secondary elements. Show background AND the main subject colored with flat base colors - about 50% of the page colored.",
                step4: "Remove detail coloring. Show most areas colored (about 75%) - main elements complete but small details and patterns uncolored.",
                step5: "Remove shading and blending. Show all areas with flat colors filled in - no gradients, shadows, or dimensional shading yet.",
                step6: "Show the nearly complete colored page - all colors applied with shading, missing only final highlights and blend perfection."
            },
            [CraftCategory.FABRIC_PAINTING]: {
                step1: "Remove ALL paint. Show ONLY the plain, unpainted fabric laid flat - no design, no color, just the blank textile surface.",
                step2: "Remove all color. Show ONLY a faint pencil or chalk outline of the design transferred onto the fabric - no paint applied.",
                step3: "Remove all detail colors. Show ONLY the largest areas painted with flat base colors - main shapes blocked in, no details.",
                step4: "Remove outlines and accents. Show base colors plus secondary colors added - pattern is visible but lacks definition and detail.",
                step5: "Remove final accents and dimension. Show nearly complete design missing only crisp outlines, highlights, and dimensional shading.",
                step6: "Show the nearly finished fabric painting - design complete, heat-set, missing only minor touch-ups."
            },
            [CraftCategory.FLOWER_VASE]: {
                step1: "Remove ALL decoration. Show ONLY the plain, clean vase with its natural surface - no paint, no design, no base coat.",
                step2: "Remove all design. Show the vase with ONLY a solid base coat/background color applied - uniform single color, no pattern.",
                step3: "Remove all detail painting. Show only the basic design outline or main shapes sketched/painted on the base coat - no filled details.",
                step4: "Remove accents and highlights. Show the main design elements painted in - flowers, patterns visible but lacking fine details and dimension.",
                step5: "Remove final polish and sealant sheen. Show nearly complete decoration missing only the brightest highlights and finest line details.",
                step6: "Show the nearly finished decorated vase - sealed and polished, missing only minor final adjustments."
            },
            [CraftCategory.JEWELRY_CUSTOMIZATION]: {
                step1: "Remove ALL customization. Show the plain, unmodified jewelry piece - original surface with no paint, no enamel, no decoration.",
                step2: "Remove all color. Show the jewelry with ONLY primer or base preparation visible - surface ready for painting but no design.",
                step3: "Remove all detail work. Show ONLY flat base colors applied to design areas - no pattern details, no shading.",
                step4: "Remove accents and dimension. Show the base pattern painted but lacking highlights, shadows, and fine embellishments.",
                step5: "Remove final polish and sealing. Show nearly complete customization missing only the brightest highlights and sealant shine.",
                step6: "Show the nearly finished customized jewelry - sealed and polished, complete except for minor final touches."
            },
            [CraftCategory.PATTERN_ART]: {
                step1: "Remove ALL drawn patterns. Show ONLY the faint geometric guidelines - circles, grids, or construction lines in pencil, no actual pattern drawn.",
                step2: "Remove all pattern layers. Show ONLY the central motif or core pattern element drawn - the starting point with no surrounding patterns.",
                step3: "Remove secondary patterns. Show the center plus the first ring/layer of repeating elements - about 30% of the final pattern visible.",
                step4: "Remove fine details and fills. Show the main pattern structure (about 60% complete) but lacking the intricate fill patterns and small embellishments.",
                step5: "Remove final embellishments. Show nearly complete pattern missing only the finest details, dots, and decorative fills.",
                step6: "Show the nearly finished pattern art - guidelines erased, all major patterns complete, missing only final line weight adjustments."
            },
            [CraftCategory.GAME_CHARACTER]: {
                step1: "Remove ALL rendering and detail. Show ONLY rough thumbnail silhouettes or gesture sketches - basic shape language with no features.",
                step2: "Remove all color and rendering. Show basic structural sketch with proportions and anatomy - stick figure or mannequin level, no features or costume.",
                step3: "Remove colors and polish. Show the rough sketch with costume elements and features indicated - loose lines, no clean linework.",
                step4: "Remove rendering and color. Show clean linework with all design elements - detailed but flat, no color or shading.",
                step5: "Remove final rendering polish. Show flat colors and basic shading applied - character reads but lacks final highlights and textures.",
                step6: "Show the nearly complete character design - full rendering with only minor polish and effects remaining."
            }
        };

        // Get category-specific removal instructions
        const categoryInstructions = categoryRemovalInstructions[category] || categoryRemovalInstructions[CraftCategory.DRAWING];
        const stepKey = `step${stepNumber}` as keyof typeof categoryInstructions;
        const removalInstruction = categoryInstructions[stepKey] || categoryInstructions.step6;

        console.log(`\n🔄 Incremental Reveal - Step ${stepNumber}/${totalSteps}`);
        console.log(`   Detail Level: ~${detailPercent}% (removing ~${removalPercent}% from master)`);
        console.log(`   Category: ${category}`);
        console.log(`   Removal: ${removalInstruction.substring(0, 80)}...`);

        // VLM instruction for REMOVAL-based refinement
        const systemInstruction = `
You are an INCREMENTAL REVEAL GENERATOR for craft learning. Your task is to create a SIMPLIFIED version of the master reference by REMOVING specific details.

🎨 MASTER REFERENCE (The finished craft - 100% complete):
This JSON describes the FINAL result that the user is working toward.

📋 THIS STEP: Step ${stepNumber} of ${totalSteps} - "${stepDescription}"
🔧 DETAIL LEVEL: Show approximately ${detailPercent}% of the master's details

CRITICAL REMOVAL INSTRUCTION FOR THIS STEP:
${removalInstruction}

YOUR TASK: Modify the Master JSON by REMOVING details as specified above.

REMOVAL-BASED GENERATION RULES:

1. **REMOVE SPECIFIC FEATURES** based on the instruction:
   - Step 1 removes the MOST detail (simplest form)
   - Each subsequent step ADDS BACK detail by removing less
   - Step 6 should be nearly identical to the master

2. **WHAT TO MODIFY IN THE JSON**:
   - objects[].description: Update to reflect the SIMPLIFIED state (e.g., "painted owl" → "unpainted clay owl")
   - objects[].shape_and_color: Remove colors/details as instructed (e.g., "blue and gold" → "natural gray clay")
   - objects[].texture: Simplify textures (e.g., "glossy painted surface" → "matte raw material")
   - short_description: Describe what IS visible at this step, not what's missing
   - context: State "${detailPercent}% complete - ${stepDescription}"

3. **PRESERVE FROM MASTER** (for visual consistency):
   - lighting (same setup)
   - photographic_characteristics (same camera angle)
   - background_setting (same backdrop)
   - Object locations and arrangement (same composition)
   - Overall number and type of objects (just simplified versions)

4. **SIMPLIFICATION HIERARCHY** (what gets removed first → last):
   - Final finish/sealant/varnish (removed first, restored last)
   - Fine details, highlights, and accents
   - Shading, shadows, and dimensional rendering
   - Secondary/accent colors and patterns
   - Base colors and major forms
   - Raw material/blank state (shown in step 1)

Return JSON showing the craft at ${detailPercent}% detail level.
`;

        const promptText = `
MASTER REFERENCE JSON (100% complete - the finished creation):
${JSON.stringify(masterPrompt, null, 2)}

INSTRUCTIONS:
${systemInstruction}

Generate the JSON for Step ${stepNumber} showing the simplified version with ~${detailPercent}% of the master's details visible.
`;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: promptText }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            short_description: { type: Type.STRING },
                            objects: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        location: { type: Type.STRING },
                                        relationship: { type: Type.STRING },
                                        relative_size: { type: Type.STRING },
                                        shape_and_color: { type: Type.STRING },
                                        texture: { type: Type.STRING },
                                        number_of_objects: { type: Type.NUMBER },
                                        action: { type: Type.STRING }
                                    },
                                    required: ["description"]
                                }
                            },
                            background_setting: { type: Type.STRING },
                            lighting: {
                                type: Type.OBJECT,
                                properties: {
                                    conditions: { type: Type.STRING },
                                    direction: { type: Type.STRING },
                                    shadows: { type: Type.STRING }
                                }
                            },
                            photographic_characteristics: {
                                type: Type.OBJECT,
                                properties: {
                                    camera_angle: { type: Type.STRING },
                                    depth_of_field: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    lens_focal_length: { type: Type.STRING }
                                }
                            },
                            aesthetics: {
                                type: Type.OBJECT,
                                properties: {
                                    composition: { type: Type.STRING },
                                    color_scheme: { type: Type.STRING },
                                    mood_atmosphere: { type: Type.STRING }
                                },
                                required: ["composition", "color_scheme", "mood_atmosphere"]
                            },
                            style_medium: { type: Type.STRING },
                            context: { type: Type.STRING }
                        },
                        required: ["short_description", "objects", "style_medium", "aesthetics", "context"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from FIBO refinement");

            const refinedPrompt = JSON.parse(text) as StructuredPrompt;
            console.log(`✅ VLM generated simplified JSON for step ${stepNumber}/${totalSteps}:`, refinedPrompt.short_description);
            console.log(`   Objects count: ${refinedPrompt.objects?.length || 0}`);
            console.log(`   Detail level: ~${detailPercent}%`);

            return this.ensureAestheticsField(refinedPrompt);
        });
    }

    /**
     * Extract consistent visual context from the master's structured prompt.
     * This identifies elements that MUST stay the same across all step images.
     * 
     * Based on reference FIBO implementation pattern.
     */
    static async extractConsistentContext(
        masterPrompt: StructuredPrompt,
        category: CraftCategory
    ): Promise<ConsistentContext> {
        const ai = getAiClient();

        const systemInstruction = `
You are an expert visual consistency analyzer for craft instruction manuals.

Analyze this MASTER PROMPT (the finished craft) and extract the visual elements that MUST remain consistent across all step-by-step photos.

MASTER PROMPT JSON:
${JSON.stringify(masterPrompt, null, 2)}

CRAFT CATEGORY: ${category}

Extract these CONSISTENT ELEMENTS that should appear in ALL step photos:

1. **background**: The exact setting/surface (e.g., "white wooden craft table with natural wood grain texture")
2. **subjects**: Main craft components/materials that will be visible (e.g., ["blue origami paper", "scissors", "glue stick"])
3. **lighting_style**: Exact lighting setup (e.g., "bright overhead studio lighting with soft shadows from 3-point setup")
4. **color_palette**: Dominant colors and material appearances (e.g., "vibrant blue paper, silver metallic scissors, warm wood tones")
5. **camera_style**: Photography approach and angle (e.g., "top-down flat lay photography, macro lens, 50mm focal length")
6. **overall_mood**: Instructional tone (e.g., "clean, professional, educational, approachable")
7. **material_appearance**: How materials look/feel (e.g., "matte paper texture, glossy glue finish, natural wood grain")

CRITICAL: These elements create visual continuity. Every step photo should feel like it's part of the SAME photoshoot with the SAME setup.

Return ONLY valid JSON matching the schema.
`;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: systemInstruction }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            background: { type: Type.STRING },
                            subjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                            lighting_style: { type: Type.STRING },
                            color_palette: { type: Type.STRING },
                            camera_style: { type: Type.STRING },
                            overall_mood: { type: Type.STRING },
                            material_appearance: { type: Type.STRING }
                        },
                        required: ["background", "subjects", "lighting_style", "color_palette", "camera_style", "overall_mood", "material_appearance"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from context extraction");

            const context = JSON.parse(text) as ConsistentContext;
            console.log(`✅ Context extracted from master:`, {
                background: context.background.substring(0, 50) + "...",
                subjects: context.subjects.length + " items",
                palette: context.color_palette.substring(0, 30) + "..."
            });

            return context;
        });
    }

    /**
     * Rewrite a step description as a detailed text prompt that explicitly includes
     * all consistent visual elements from the master image.
     * 
     * This is the KEY to visual consistency - making implicit elements EXPLICIT.
     * Based on reference FIBO implementation pattern.
     */
    static async rewriteStepPromptForConsistency(
        stepDescription: string,
        context: ConsistentContext,
        stepNumber: number,
        totalSteps: number,
        category: CraftCategory
    ): Promise<string> {
        const ai = getAiClient();

        const completionPercent = Math.round((stepNumber / totalSteps) * 100);

        const systemInstruction = `
You are a professional craft photographer creating step-by-step instruction photos that maintain PERFECT visual consistency.

CONTEXT FROM MASTER (elements that MUST appear in ALL photos):
- Background: ${context.background}
- Subjects/Materials: ${context.subjects.join(", ")}
- Lighting: ${context.lighting_style}
- Colors: ${context.color_palette}  
- Camera: ${context.camera_style}
- Mood: ${context.overall_mood}
- Materials: ${context.material_appearance}

THIS STEP (${stepNumber}/${totalSteps}, ~${completionPercent}% complete):
"${stepDescription}"

CATEGORY: ${category}

YOUR TASK: Rewrite this step description as a DETAILED text-to-image prompt that:

1. **Describes the step-specific action/state** (what's being shown in THIS step)
2. **Explicitly includes the EXACT background** from context (word-for-word)
3. **Lists visible subjects/materials** appropriate for ${completionPercent}% completion
4. **States the EXACT lighting setup** from context
5. **Uses the EXACT color palette** language from context
6. **Specifies the EXACT camera style** from context
7. **Maintains the instructional mood** from context
8. **Describes material appearance** from context

EXAMPLE FORMAT:
"[Step action], professional craft photography on [exact background], [lighting setup], [camera angle], showing [materials at this stage], [color palette], [material textures], clean instructional style"

Make it detailed and specific. The AI should generate an image that looks like it came from the SAME photoshoot as the master image.

Return ONLY the rewritten prompt text, no explanation or quotes.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: systemInstruction }] }
        });

        let rewrittenPrompt = response.text.trim();

        // Clean any markdown quotes or formatting
        rewrittenPrompt = rewrittenPrompt.replace(/^["']|["']$/g, '').trim();

        console.log(`✅ Step ${stepNumber}/${totalSteps} prompt rewritten (${rewrittenPrompt.length} chars)`);
        console.log(`   Preview: ${rewrittenPrompt.substring(0, 80)}...`);

        return rewrittenPrompt;
    }
    /**
     * Adapts an extracted structured prompt (from an uploaded image) to fit a specific craft category style.
     * Keeps the composition and object arrangement but updates the aesthetics and materials.
     */
    static async adaptStructuredPromptToCategory(
        sourcePrompt: StructuredPrompt,
        category: CraftCategory
    ): Promise<StructuredPrompt> {
        const ai = getAiClient();

        const systemInstruction = `
You are an expert art director adapting a visual scene for a specific craft category.

SOURCE SCENE (Structure Reference):
${JSON.stringify(sourcePrompt, null, 2)}

TARGET CATEGORY: ${category}

YOUR TASK: Modify the Source JSON to fit the Target Category style while PRESERVING the original structure.

RULES:
1. **PRESERVE STRUCTURE**: Keep the same number of objects, their locations, relationships, and relative sizes. The composition must match the source.
2. **ADAPT MATERIALS/OBJECTS**: If the source objects are generic, describe them as materials relevant to ${category}.
   - Example: If conversion to "Clay", objects become "clay figures".
   - Example: If conversion to "Papercraft", objects become "paper cutouts".
3. **ADAPT VISUAL STYLE**: Update 'aesthetics', 'lighting', 'style_medium' to match professional photography for ${category}.
4. **ADAPT BACKGROUND**: Set a background appropriate for the craft (e.g., cutting mat for papercraft, easel for painting).

Return ONLY the adapted JSON object matching the Bria StructuredPrompt schema.
`;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: systemInstruction }] },
                config: {
                    responseMimeType: "application/json",
                    // Reuse schema from createMasterPrompt
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            short_description: { type: Type.STRING },
                            objects: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        location: { type: Type.STRING },
                                        relationship: { type: Type.STRING },
                                        relative_size: { type: Type.STRING },
                                        shape_and_color: { type: Type.STRING },
                                        texture: { type: Type.STRING },
                                        number_of_objects: { type: Type.NUMBER }
                                    },
                                    required: ["description", "relationship"]
                                }
                            },
                            background_setting: { type: Type.STRING },
                            lighting: {
                                type: Type.OBJECT,
                                properties: {
                                    conditions: { type: Type.STRING },
                                    direction: { type: Type.STRING },
                                    shadows: { type: Type.STRING }
                                },
                                required: ["conditions", "direction", "shadows"]
                            },
                            aesthetics: {
                                type: Type.OBJECT,
                                properties: {
                                    composition: { type: Type.STRING },
                                    color_scheme: { type: Type.STRING },
                                    mood_atmosphere: { type: Type.STRING }
                                },
                                required: ["composition", "color_scheme", "mood_atmosphere"]
                            },
                            photographic_characteristics: {
                                type: Type.OBJECT,
                                properties: {
                                    camera_angle: { type: Type.STRING },
                                    depth_of_field: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    lens_focal_length: { type: Type.STRING }
                                },
                                required: ["camera_angle", "depth_of_field", "focus", "lens_focal_length"]
                            },
                            style_medium: { type: Type.STRING },
                            context: { type: Type.STRING }
                        },
                        required: ["short_description", "objects", "style_medium", "aesthetics", "context"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from category adaptation");
            const prompt = JSON.parse(text) as StructuredPrompt;
            return this.ensureAestheticsField(prompt);
        });
    }
}
