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
Your goal is to convert a user's craft idea into a detailed, photorealistic Structured Prompt.

CATEGORY: ${category}
USER PROMPT: "${userPrompt}"

REQUIREMENTS:
1. Create a detailed scene description suitable for a finished DIY craft.
2. The image MUST be photorealistic, showing the finished object.
3. Use high-quality lighting (studio or natural) and appropriate aesthetics for the category.
4. Ensure the background is neutral but textured (e.g., wooden table, cutting mat) to emphasize the craft.
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
     * FIBO Refine Mode: Uses VLM to modify the master's structured JSON for progressive construction.
     * 
     * Key behavior:
     * - Step 1: Modify objects to show only raw materials/foundation (~15%)
     * - Steps 2-5: Progressively add more objects/details
     * - Final step: Return master prompt AS-IS (100% complete)
     * 
     * @param masterPrompt The master image's structured prompt (source of truth)
     * @param stepDescription What this step should show
     * @param stepNumber Current step (1-indexed)
     * @param totalSteps Total number of steps
     * @param category Craft category for context
     */
    static async refineStructuredPrompt(
        masterPrompt: StructuredPrompt,
        stepDescription: string,
        stepNumber: number,
        totalSteps: number,
        category: CraftCategory
    ): Promise<StructuredPrompt> {
        // FINAL STEP: Return master prompt exactly for 100% match
        if (stepNumber === totalSteps) {
            console.log(`🎯 Step ${stepNumber}/${totalSteps}: Returning master prompt as-is (100% complete)`);
            return masterPrompt;
        }

        const ai = getAiClient();
        const completionPercent = Math.round((stepNumber / totalSteps) * 100);

        const systemInstruction = `
You are a FIBO VLM refiner. Your job is to MODIFY a structured JSON prompt to show a specific stage of construction.

MASTER JSON: This describes the FINISHED craft (100% complete).
YOUR TASK: Modify this JSON to show the craft at ${completionPercent}% completion.

STEP ${stepNumber} of ${totalSteps}: "${stepDescription}"
CATEGORY: ${category}
COMPLETION: ~${completionPercent}%

CRITICAL RULES FOR JSON MODIFICATION:

1. **OBJECTS ARRAY**: This is what you modify most.
   - Step 1 (~15%): Keep ONLY 1-2 objects representing raw materials
   - Step 2 (~30%): Keep 2-3 objects, some partially assembled
   - Step 3 (~50%): Keep 3-4 objects, half assembled
   - Step 4 (~70%): Keep most objects, nearly complete
   - Step 5 (~85%): Keep all objects, just missing final details

2. **WHAT TO PRESERVE** (keep exactly the same):
   - lighting (same camera setup)
   - aesthetics (same style/mood)
   - photographic_characteristics (same camera angle)
   - background_setting (same backdrop)
   - style_medium (same medium)

3. **WHAT TO MODIFY**:
   - objects: Reduce for early steps, add more for later steps
   - short_description: Update to describe this stage
   - context: Update to describe the progress level

4. **OBJECT MODIFICATIONS**:
   - For early steps: Show objects as separated/unassembled
   - Add "location": "laid flat on surface" for knolling style
   - Remove "relationship" that implies connection for early steps
   - Add descriptors like "unassembled", "separate pieces", "raw materials"

Return the MODIFIED JSON that represents this step's visual state.
`;

        const promptText = `
MASTER PROMPT JSON (100% complete):
${JSON.stringify(masterPrompt, null, 2)}

INSTRUCTIONS:
${systemInstruction}

Return ONLY the modified JSON for step ${stepNumber} (~${completionPercent}% complete).
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
            console.log(`✅ VLM refined JSON for step ${stepNumber}/${totalSteps}:`, refinedPrompt.short_description);
            console.log(`   Objects count: ${refinedPrompt.objects?.length || 0} (master had ${masterPrompt.objects?.length || 0})`);

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
}
