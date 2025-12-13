import { GoogleGenAI } from "@google/genai";
import { decryptApiKey } from "../utils/encryption";

// Application API key (fallback)
const appApiKey = process.env.API_KEY || '';

/**
 * Gets the API key to use for requests
 * Prioritizes user's personal API key over application key
 */
export const getApiKey = (): string => {
    try {
        // Check for user's personal API key in LocalStorage
        const encryptedKey = localStorage.getItem('craftus_user_api_key');
        if (encryptedKey) {
            try {
                const userKey = decryptApiKey(encryptedKey);
                if (userKey) {
                    // console.log('Using personal API key');
                    return userKey;
                }
            } catch (error) {
                console.warn('Failed to decrypt user API key, falling back to app key');
                // Remove invalid key
                localStorage.removeItem('craftus_user_api_key');
            }
        }
    } catch (error) {
        console.warn('Error accessing user API key:', error);
    }

    // Fall back to application API key
    // console.log('Using application API key');
    return appApiKey;
};

export const getAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Helper to wait for a specified duration.
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper for API calls to handle 503/429 Overloaded errors.
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 2000
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        const isOverloaded = error?.status === 503 || error?.code === 503 || error?.message?.includes('overloaded');

        if (retries > 0 && isOverloaded) {
            console.warn(`Model overloaded. Retrying in ${delay}ms... (${retries} attempts left)`);
            await wait(delay);
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}
