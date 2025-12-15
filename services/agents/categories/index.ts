/**
 * Category Agents Barrel Export
 * Central registry for all category-specific agents.
 */

import { ActivityCategory, CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

// Import all category agents
import { DrawingAgent } from './DrawingAgent';
import { ColoringBookAgent } from './ColoringBookAgent';
import { MiniaturePaintingAgent } from './MiniaturePaintingAgent';
import { FabricPaintingAgent } from './FabricPaintingAgent';
import { FlowerVaseAgent } from './FlowerVaseAgent';
import { WatercolorAgent } from './WatercolorAgent';
import { OilPaintingAgent } from './OilPaintingAgent';
import { JewelryCustomizationAgent } from './JewelryCustomizationAgent';
import { PatternArtAgent } from './PatternArtAgent';
import { GameCharacterAgent } from './GameCharacterAgent';

// Export all agents individually
export { DrawingAgent } from './DrawingAgent';
export { ColoringBookAgent } from './ColoringBookAgent';
export { MiniaturePaintingAgent } from './MiniaturePaintingAgent';
export { FabricPaintingAgent } from './FabricPaintingAgent';
export { FlowerVaseAgent } from './FlowerVaseAgent';
export { WatercolorAgent } from './WatercolorAgent';
export { OilPaintingAgent } from './OilPaintingAgent';
export { JewelryCustomizationAgent } from './JewelryCustomizationAgent';
export { PatternArtAgent } from './PatternArtAgent';
export { GameCharacterAgent } from './GameCharacterAgent';

/**
 * Map of category to agent instance.
 * This allows the orchestrator to route by category.
 */
const categoryAgentMap: Map<ActivityCategory, CategoryAgentBase> = new Map();

// Initialize and register all category agents
const drawingAgent = new DrawingAgent();
const coloringBookAgent = new ColoringBookAgent();
const miniaturePaintingAgent = new MiniaturePaintingAgent();
const fabricPaintingAgent = new FabricPaintingAgent();
const flowerVaseAgent = new FlowerVaseAgent();
const watercolorAgent = new WatercolorAgent();
const oilPaintingAgent = new OilPaintingAgent();
const jewelryCustomizationAgent = new JewelryCustomizationAgent();
const patternArtAgent = new PatternArtAgent();
const gameCharacterAgent = new GameCharacterAgent();

categoryAgentMap.set(ActivityCategory.DRAWING, drawingAgent);
categoryAgentMap.set(ActivityCategory.COLORING_BOOK, coloringBookAgent);
categoryAgentMap.set(ActivityCategory.MINIATURE_PAINTING, miniaturePaintingAgent);
categoryAgentMap.set(ActivityCategory.FABRIC_PAINTING, fabricPaintingAgent);
categoryAgentMap.set(ActivityCategory.FLOWER_VASE, flowerVaseAgent);
categoryAgentMap.set(ActivityCategory.WATERCOLOR, watercolorAgent);
categoryAgentMap.set(ActivityCategory.OIL_PAINTING, oilPaintingAgent);
categoryAgentMap.set(ActivityCategory.JEWELRY_CUSTOMIZATION, jewelryCustomizationAgent);
categoryAgentMap.set(ActivityCategory.PATTERN_ART, patternArtAgent);
categoryAgentMap.set(ActivityCategory.GAME_CHARACTER, gameCharacterAgent);

/**
 * Get all category agent instances.
 * Used by the orchestrator for bulk registration.
 */
export function getAllCategoryAgents(): CategoryAgentBase[] {
    return Array.from(categoryAgentMap.values());
}

/**
 * Get a specific category agent by category.
 * @param category The activity category
 * @returns The agent for that category, or undefined if not found
 */
export function getCategoryAgent(category: ActivityCategory | CraftCategory): CategoryAgentBase | undefined {
    return categoryAgentMap.get(category as ActivityCategory);
}

/**
 * Check if a category has a registered agent.
 */
export function hasCategoryAgent(category: ActivityCategory | CraftCategory): boolean {
    return categoryAgentMap.has(category as ActivityCategory);
}
