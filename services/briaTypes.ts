/**
 * Bria AI FIBO JSON-Native Control Types.
 * Based on the schema provided in the documentation.
 */

export interface StructuredPromptObject {
    description: string;
    location?: string;
    relationship?: string; // How it relates to other objects (required) or context
    relative_size?: string;
    shape_and_color?: string;
    texture?: string;
    appearance_details?: string;
    number_of_objects?: number;
    pose?: string;
    expression?: string;
    clothing?: string;
    action?: string;
    gender?: string;
    skin_tone_and_texture?: string;
    orientation?: string;
}

export interface LightingControl {
    conditions?: string; // e.g., natural, studio, dramatic
    direction?: string; // e.g., top, side, backlighting
    shadows?: string; // e.g., soft, harsh, long
}

export interface AestheticControl {
    composition?: string;
    color_scheme?: string;  // Changed from color_palette
    mood_atmosphere?: string;  // Changed from mood
}

export interface PhotographicCharacteristics {
    depth_of_field?: string; // shallow, medium, deep
    focus?: string; // what's in focus
    camera_angle?: string; // eye-level, low, high, aerial
    lens_focal_length?: string; // 35mm, 50mm, 85mm, wide-angle, telephoto
}

export interface StructuredPrompt {
    short_description: string;
    objects?: StructuredPromptObject[];
    background_setting?: string;
    lighting?: LightingControl;
    aesthetics: AestheticControl;
    photographic_characteristics?: PhotographicCharacteristics;
    style_medium?: string; // e.g. photography
    artistic_style?: string;
    context: string;
    text_render?: any[];
}

export interface ConsistentContext {
    background: string;
    subjects: string[];
    lighting_style: string;
    color_palette: string;
    camera_style: string;
    overall_mood: string;
    material_appearance: string;
}

export interface BriaGenerationResult {
    imageUrl: string;
    structuredPrompt?: StructuredPrompt;
    seed: number;
    context?: ConsistentContext;
}

export interface BriaGeneratePayload {
    structured_prompt?: StructuredPrompt;
    prompt?: string; // Fallback or V1 prompt
    aspect_ratio?: "1:1" | "16:9" | "9:16" | "3:2" | "4:3" | "4:5" | "5:4" | "3:4" | "2:3";
    steps_num?: number;
    guidance_scale?: number;
    seed?: number;
    sync?: boolean;
    negative_prompt?: string;
    images?: string[]; // For image-to-image or refine
}
