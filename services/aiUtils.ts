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

export const FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-09-2025",
    "gemini-3-pro-preview"
];

/**
 * Retry wrapper that tries multiple models in sequence if the previous one is overloaded.
 * For each model, it performs standard retries with backoff.
 */
export async function retryWithModelFallback<T>(
    operation: (modelId: string) => Promise<T>,
    models: string[] = FALLBACK_MODELS
): Promise<T> {
    let lastError: any;

    for (const model of models) {
        try {
            // Attempt the operation with the current model, including its own internal retries
            return await retryWithBackoff(
                () => operation(model),
                3, // retries per model
                2000 // initial delay
            );
        } catch (error: any) {
            lastError = error;
            const isOverloaded = error?.status === 503 || error?.code === 503 || error?.message?.includes('overloaded');

            // If it's an overload error, log and try the next model
            if (isOverloaded) {
                console.warn(`Model ${model} overloaded. Falling back to next model...`);
                continue;
            }

            // If it's not an overload error (e.g. 400 Bad Request), fail immediately
            throw error;
        }
    }

    // If we exhausted all models, throw the last error (likely an overload error)
    if (lastError) {
        console.error("All models overloaded or failed.");
        throw lastError;
    }

    throw new Error("Model generation failed with no error captured.");
}
