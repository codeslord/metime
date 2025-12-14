import { wait } from "./aiUtils";
import { decryptApiKey } from "../utils/encryption";
import { StructuredPrompt } from "./briaTypes";

const BRIA_API_BASE_URL = 'https://engine.prod.bria-api.com/v2';

interface BriaGenerateResponse {
    request_id: string;
    status_url: string;
}

interface BriaStatusResponse {
    status: 'INPUT_RECEIVED' | 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    message?: string;
    result?: {
        image_url: string;
        structured_prompt: StructuredPrompt;
    };
}

/**
 * Service for interacting with Bria AI (FIBO) API.
 */
export class BriaService {
    private static getApiToken(): string {
        try {
            const encryptedKey = localStorage.getItem('craftus_user_bria_api_key');
            if (encryptedKey) {
                const userKey = decryptApiKey(encryptedKey);
                if (userKey) return userKey;
            }
        } catch (e) {
            console.warn('Error reading user Bria key', e);
        }

        const token = import.meta.env.VITE_BRIA_API_TOKEN || process.env.BRIA_API_TOKEN;
        if (!token) {
            console.warn('BRIA_API_TOKEN not found in environment variables');
            throw new Error('Missing BRIA_API_TOKEN');
        }
        return token;
    }

    /**
     * Polls the status URL until the generation is complete or failed.
     * Increased timeout to accommodate complex prompts.
     */
    private static async pollResult(statusUrl: string, maxAttempts = 60, intervalMs = 3000): Promise<string> {
        const token = this.getApiToken();

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const resp = await fetch(statusUrl, {
                    headers: {
                        'api_token': token
                    }
                });

                if (!resp.ok) {
                    const errorText = await resp.text();
                    throw new Error(`Bria status check failed: ${resp.status} ${resp.statusText} - ${errorText}`);
                }

                const data: BriaStatusResponse = await resp.json();
                console.log(`Bria poll attempt ${i + 1}/${maxAttempts}: ${data.status}`);

                const status = data.status;

                if (status === 'COMPLETED' && data.result?.image_url) {
                    return data.result.image_url;
                } else if (status === 'FAILED') {
                    throw new Error(`Bria generation failed: ${data.message || 'Unknown error'}`);
                }

                // Wait before next poll
                await wait(intervalMs);
            } catch (error) {
                console.error('Error polling Bria status:', error);
                throw error;
            }
        }

        throw new Error('Bria generation timed out');
    }

    /**
     * Generates a structured prompt from an input image.
     * This is an async operation that requires polling.
     */
    static async generateStructuredPrompt(image: string): Promise<StructuredPrompt> {
        const token = this.getApiToken();
        const url = `${BRIA_API_BASE_URL}/structured_prompt/generate`;

        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api_token': token
                },
                body: JSON.stringify({
                    images: [image],
                    prompt: "Describe this image structure"
                })
            });

            if (!resp.ok) {
                const errorText = await resp.text();
                throw new Error(`Bria structured prompt generation failed: ${resp.status} - ${errorText}`);
            }

            const data: BriaGenerateResponse = await resp.json();
            console.log('Bria generateStructuredPrompt initial response:', JSON.stringify(data, null, 2));

            if (!data.status_url) {
                throw new Error('No status_url received from Bria structured_prompt API');
            }

            // Poll for the result
            const structuredPrompt = await this.pollStructuredPromptResult(data.status_url);
            return structuredPrompt;
        } catch (error) {
            console.error('Bria Structured Prompt Error:', error);
            throw error;
        }
    }

    /**
     * Polls the status URL for structured prompt generation result.
     */
    private static async pollStructuredPromptResult(statusUrl: string, maxAttempts = 30, intervalMs = 2000): Promise<StructuredPrompt> {
        const token = this.getApiToken();

        for (let i = 0; i < maxAttempts; i++) {
            try {
                const resp = await fetch(statusUrl, {
                    headers: {
                        'api_token': token
                    }
                });

                if (!resp.ok) {
                    const errorText = await resp.text();
                    throw new Error(`Bria structured prompt status check failed: ${resp.status} ${resp.statusText} - ${errorText}`);
                }

                const data: BriaStatusResponse = await resp.json();
                console.log(`Bria structured prompt poll attempt ${i + 1}/${maxAttempts}: ${data.status}`);

                const status = data.status;

                if (status === 'COMPLETED' && data.result?.structured_prompt) {
                    return data.result.structured_prompt as StructuredPrompt;
                } else if (status === 'FAILED') {
                    throw new Error(`Bria structured prompt generation failed: ${data.message || 'Unknown error'}`);
                }

                // Wait before next poll
                await wait(intervalMs);
            } catch (error) {
                console.error('Error polling Bria structured prompt status:', error);
                throw error;
            }
        }

        throw new Error('Bria structured prompt generation timed out');
    }

    /**
     * Generates an image using Bria AI v2.
     * @param prompt The text prompt (optional if structured prompt is provided).
     * @param images Optional array of reference images.
     * @param structuredPrompt Optional structured prompt for precise control.
     */
    static async generateImage(prompt: string, images?: string[], structuredPrompt?: StructuredPrompt): Promise<string> {
        const token = this.getApiToken();
        const url = `${BRIA_API_BASE_URL}/image/generate`;

        try {
            const payload: any = {};

            // If structured prompt is provided, it takes precedence or complements relevant fields
            if (structuredPrompt) {
                // Validate that aesthetics field is present (required by Bria API)
                if (!structuredPrompt.aesthetics) {
                    throw new Error('Structured prompt missing required aesthetics field');
                }
                if (!structuredPrompt.aesthetics.composition ||
                    !structuredPrompt.aesthetics.color_scheme ||
                    !structuredPrompt.aesthetics.mood_atmosphere) {
                    throw new Error('Aesthetics field missing required sub-fields (composition, color_scheme, mood_atmosphere)');
                }

                // Bria API expects structured_prompt as a JSON STRING (not an object)
                const structuredPromptString = JSON.stringify(structuredPrompt);
                payload.structured_prompt = structuredPromptString;

                // Debug logging
                console.log('Bria Structured Prompt (Object):', JSON.stringify(structuredPrompt, null, 2));
                console.log('Bria Structured Prompt (String):', structuredPromptString);
            } else {
                // Only send 'prompt' if no structured prompt
                payload.prompt = prompt;
            }

            if (images && images.length > 0) {
                payload.images = images;
            }

            console.log('Bria Full Payload (before stringify):', payload);
            console.log('Bria Full Payload (after stringify):', JSON.stringify(payload, null, 2));

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api_token': token
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const errorText = await resp.text();
                throw new Error(`Bria generate request failed: ${resp.status} ${resp.statusText} - ${errorText}`);
            }

            const data: BriaGenerateResponse = await resp.json();

            if (!data.status_url) {
                throw new Error('No status_url received from Bria API');
            }

            // Return the final image URL after polling
            return await this.pollResult(data.status_url);

        } catch (error) {
            console.error('Bria Image Generation Error:', error);
            throw error;
        }
    }
}
