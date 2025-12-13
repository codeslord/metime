import { CraftCategory, DissectionResponse } from "../types";
import { AgentOrchestrator } from "./orchestrator/AgentOrchestrator";
import { VisualizerAgent } from "./agents/VisualizerAgent";
import { DissectionAgent } from "./agents/DissectionAgent";
import { PatternAgent } from "./agents/PatternAgent";

// Initialize Orchestrator and Agents
const orchestrator = new AgentOrchestrator();

// Register Core Agents on startup
orchestrator.registerAgent(new VisualizerAgent());
orchestrator.registerAgent(new DissectionAgent());
orchestrator.registerAgent(new PatternAgent());

console.log('🤖 Agent A2A System Initialized');

/**
 * Generates a realistic image of the craft concept.
 */
export const generateCraftImage = async (
  prompt: string,
  category: CraftCategory
): Promise<string> => {
  return orchestrator.dispatch('generate_master_image', { prompt, category });
};

/**
 * Generates a craft-style image from an uploaded image.
 */
export const generateCraftFromImage = async (
  imageBase64: string,
  category: CraftCategory
): Promise<string> => {
  return orchestrator.dispatch('generate_craft_from_image', { imageBase64, category });
};

/**
 * Generates a visualization for a specific step using the master image as reference.
 */
export const generateStepImage = async (
  originalImageBase64: string,
  stepDescription: string,
  category: CraftCategory,
  targetObjectLabel?: string,
  stepNumber?: number
): Promise<string> => {
  return orchestrator.dispatch('generate_step_image', {
    originalImageBase64,
    stepDescription,
    category,
    targetObjectLabel,
    stepNumber
  });
};

/**
 * Generates a turn table view (left, right, or back) of the craft object
 */
export const generateTurnTableView = async (
  originalImageBase64: string,
  view: 'left' | 'right' | 'back',
  craftLabel?: string
): Promise<string> => {
  return orchestrator.dispatch('generate_turntable', {
    originalImageBase64,
    view,
    craftLabel
  });
};

/**
 * Generates a comprehensive pattern sheet showing all components
 */
export const generateSVGPatternSheet = async (
  originalImageBase64: string,
  category: CraftCategory,
  craftLabel?: string
): Promise<string> => {
  return orchestrator.dispatch('generate_pattern_sheet', {
    originalImageBase64,
    category,
    craftLabel
  });
};

/**
 * Identifies what object was selected by analyzing the extracted image
 */
export const identifySelectedObject = async (
  selectedObjectBase64: string,
  fullImageBase64: string
): Promise<string> => {
  return orchestrator.dispatch('identify_object', {
    selectedObjectBase64,
    fullImageBase64
  });
};

/**
 * Dissects only the selected object from an image
 */
export const dissectSelectedObject = async (
  selectedObjectBase64: string,
  fullImageBase64: string,
  objectLabel: string
): Promise<DissectionResponse> => {
  return orchestrator.dispatch('dissect_object', {
    selectedObjectBase64,
    fullImageBase64,
    objectLabel
  });
};

/**
 * Analyzes the image and breaks it down into steps (Dissection).
 */
export const dissectCraft = async (
  imageBase64: string,
  userPrompt: string
): Promise<DissectionResponse> => {
  return orchestrator.dispatch('dissect_craft', {
    imageBase64,
    userPrompt
  });
};