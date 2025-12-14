import { wait } from "./aiUtils";
import { decryptApiKey } from "../utils/encryption";

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
        structured_prompt: any;
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
     */
    private static async pollResult(statusUrl: string, maxAttempts = 30, intervalMs = 2000): Promise<string> {
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

                const data: any = await resp.json();
                console.log('Bria poll response:', JSON.stringify(data, null, 2));

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
     * Generates an image using Bria AI v2.
   * @param prompt The text prompt for generation.
   * @param images Optional array of reference images (URLs or Base64 depending on API support).
   */
    static async generateImage(prompt: string, images?: string[]): Promise<string> {
        const token = this.getApiToken();
        const url = `${BRIA_API_BASE_URL}/image/generate`;

        try {
            const payload: any = { prompt };
            if (images && images.length > 0) {
                payload.images = images;
            }

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
