import { AgentBase } from '../a2a/AgentBase';
import { AgentCard, A2AMessage } from '../a2a/types';
import { getAiClient, retryWithBackoff } from '../aiUtils';
import { dissectionLimiter, trackApiUsage } from '../../utils/rateLimiter';
import { DissectionResponse } from '../../types';
import { Type } from "@google/genai";

export class DissectionAgent extends AgentBase {
    readonly card: AgentCard = {
        name: 'DissectionAgent',
        version: '1.0.0',
        description: 'Analyzes visual content to break down crafts into steps and materials.',
        capabilities: [
            {
                intent: 'dissect_craft',
                description: 'Analyze an image and return structured step-by-step instructions.',
                inputSchema: { imageBase64: 'string', userPrompt: 'string' }
            },
            {
                intent: 'dissect_object',
                description: 'Analyze a specific selected object from an image.',
                inputSchema: { selectedObjectBase64: 'string', fullImageBase64: 'string', objectLabel: 'string' }
            },
            {
                intent: 'identify_object',
                description: 'Identify the name/label of a selected object.',
                inputSchema: { selectedObjectBase64: 'string', fullImageBase64: 'string' }
            }
        ]
    };

    async processTask(task: A2AMessage): Promise<A2AMessage> {
        const { intent } = task.payload;

        try {
            let result;
            switch (intent) {
                case 'dissect_craft':
                    result = await this.dissectCraft(task.payload.imageBase64, task.payload.userPrompt);
                    break;
                case 'dissect_object':
                    result = await this.dissectSelectedObject(
                        task.payload.selectedObjectBase64,
                        task.payload.fullImageBase64,
                        task.payload.objectLabel
                    );
                    break;
                case 'identify_object':
                    result = await this.identifySelectedObject(
                        task.payload.selectedObjectBase64,
                        task.payload.fullImageBase64
                    );
                    break;
                default:
                    throw new Error(`Unknown intent: ${intent}`);
            }
            return this.createResponse(task, { result });
        } catch (error: any) {
            return this.createErrorResponse(task, error.message || 'Unknown error in DissectionAgent');
        }
    }

    // --- Implementation Methods ---

    private async dissectCraft(imageBase64: string, userPrompt: string): Promise<DissectionResponse> {
        if (!dissectionLimiter.canMakeRequest()) {
            const waitTime = dissectionLimiter.getTimeUntilNextRequest();
            const waitSeconds = Math.ceil(waitTime / 1000);
            throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds.`);
        }

        const ai = getAiClient();
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

        // Using the same prompt logic as geminiService.ts
        const prompt = `
    You are an expert maker. Analyze this image of a craft project: "${userPrompt}".
    YOUR TASK: Create step-by-step instructions to build THIS craft.
    1. Determine the complexity (Simple, Moderate, Complex) and a score 1-10.
    2. List the essential materials visible or implied.
    3. Break down the construction into EXACTLY 4 STEPS grouped by body parts.
    
    🚨 MANDATORY 4-STEP BODY PART GROUPING 🚨
    STEP 1 - HEAD GROUP: Head, face, hair, accessories.
    STEP 2 - BODY GROUP: Torso, structure.
    STEP 3 - CLOTHING/SURFACE GROUP: Clothing, details, textures.
    STEP 4 - LIMBS & PROPS: Arms, legs, props, base.
    
    Return strict JSON matching the schema.
    `;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ inlineData: { mimeType: 'image/png', data: cleanBase64 } }, { text: prompt }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            complexity: { type: Type.STRING, enum: ["Simple", "Moderate", "Complex"] },
                            complexityScore: { type: Type.NUMBER },
                            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                            steps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        stepNumber: { type: Type.NUMBER },
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        safetyWarning: { type: Type.STRING, nullable: true },
                                    },
                                    required: ["stepNumber", "title", "description"],
                                },
                            },
                        },
                        required: ["complexity", "complexityScore", "materials", "steps"],
                    },
                },
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from dissection model");
            trackApiUsage('dissectCraft', true);
            return JSON.parse(text) as DissectionResponse;
        }).catch(e => {
            trackApiUsage('dissectCraft', false);
            throw e;
        });
    }

    private async dissectSelectedObject(
        selectedObjectBase64: string,
        fullImageBase64: string,
        objectLabel: string
    ): Promise<DissectionResponse> {
        if (!dissectionLimiter.canMakeRequest()) throw new Error('Rate limit exceeded');

        const ai = getAiClient();
        const cleanSelected = selectedObjectBase64.split(',')[1] || selectedObjectBase64;
        const cleanFull = fullImageBase64.split(',')[1] || fullImageBase64;

        const prompt = `
      You are an expert maker. I have SELECTED A SPECIFIC SINGLE OBJECT: "${objectLabel}".
      CONTEXT: Full project (Image 2).
      TARGET: Selected Object (Image 1).
      
      YOUR TASK: Create step-by-step instructions to build THIS ONE OBJECT ONLY.
      Ignore background elements or other characters.
      
      MANDATORY: EXACTLY 4 STEPS grouped by body parts (Head, Body, Clothing, Limbs).
      Return JSON.
      `;

        return retryWithBackoff(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: cleanSelected } },
                        { inlineData: { mimeType: 'image/png', data: cleanFull } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    // Same schema as dissectCraft
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            complexity: { type: Type.STRING, enum: ["Simple", "Moderate", "Complex"] },
                            complexityScore: { type: Type.NUMBER },
                            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
                            steps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        stepNumber: { type: Type.NUMBER },
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        safetyWarning: { type: Type.STRING, nullable: true },
                                    },
                                    required: ["stepNumber", "title", "description"],
                                },
                            },
                        },
                        required: ["complexity", "complexityScore", "materials", "steps"],
                    },
                }
            });
            const text = response.text;
            if (!text) throw new Error("No text returned");
            trackApiUsage('dissectSelectedObject', true);
            return JSON.parse(text) as DissectionResponse;
        }).catch(e => {
            trackApiUsage('dissectSelectedObject', false);
            throw e;
        });
    }

    private async identifySelectedObject(selectedBase64: string, fullBase64: string): Promise<string> {
        const ai = getAiClient();
        const prompt = `
      Identify the specific object selected in IMAGE 1 (transparent background).
      IMAGE 2 provides context.
      Return ONLY the specific object name (e.g. "Mario figure", "Hylian Shield").
      No extra text.
      `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/png', data: selectedBase64.split(',')[1] || selectedBase64 } },
                        { inlineData: { mimeType: 'image/png', data: fullBase64.split(',')[1] || fullBase64 } },
                        { text: prompt }
                    ]
                }
            });
            return response.text?.trim() || 'Selected Object';
        } catch (e) {
            console.error('Failed to identify object', e);
            return 'Selected Object';
        }
    }
}
