import { getAiClient, retryWithBackoff } from "./aiUtils";
import { StructuredPrompt, AestheticControl } from "./briaTypes";
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
     */
    static async adaptPromptForStep(
        basePrompt: StructuredPrompt,
        stepDescription: string,
        category: CraftCategory
    ): Promise<StructuredPrompt> {
        const ai = getAiClient();

        const systemInstruction = `
You are an expert technical illustrator and photographer for DIY guides.
Transform the provided "Master Prompt" (which describes the finished product) into a specific instruction image for this step.

CURRENT STEP: "${stepDescription}"
CATEGORY: ${category}

RULES for STEP VISUALIZATION:
1. FOCUS: Isolate ONLY the components active in this step. Remove finished elements that haven't been added yet.
2. LAYOUT: Use "Knolling" (flat lay) or "Action Shot" (hands working) as appropriate for the step.
3. CONSISTENCY: Keep the same materials, colors, and textures from the Master Prompt.
4. BACKGROUND: Change to a clean, white or very neutral background to remove distractions.
5. LIGHTING: Ensure bright, even visibility.

Modify the JSON to reflect this step.
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
}
