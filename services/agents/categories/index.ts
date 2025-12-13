/**
 * Category Agents Barrel Export
 * Central registry for all category-specific agents.
 */

import { CraftCategory } from '../../../types';
import { CategoryAgentBase } from '../CategoryAgentBase';

// Import all category agents
import { PapercraftAgent } from './PapercraftAgent';
import { ClayAgent } from './ClayAgent';
import { WoodcraftAgent } from './WoodcraftAgent';
import { JewelryAgent } from './JewelryAgent';
import { KidsCraftsAgent } from './KidsCraftsAgent';
import { ColoringBookAgent } from './ColoringBookAgent';
import { CostumePropsAgent } from './CostumePropsAgent';

// Export all agents individually
export { PapercraftAgent } from './PapercraftAgent';
export { ClayAgent } from './ClayAgent';
export { WoodcraftAgent } from './WoodcraftAgent';
export { JewelryAgent } from './JewelryAgent';
export { KidsCraftsAgent } from './KidsCraftsAgent';
export { ColoringBookAgent } from './ColoringBookAgent';
export { CostumePropsAgent } from './CostumePropsAgent';

/**
 * Map of category to agent instance.
 * This allows the orchestrator to route by category.
 */
const categoryAgentMap: Map<CraftCategory, CategoryAgentBase> = new Map();

// Initialize and register all category agents
const papercraftAgent = new PapercraftAgent();
const clayAgent = new ClayAgent();
const woodcraftAgent = new WoodcraftAgent();
const jewelryAgent = new JewelryAgent();
const kidsCraftsAgent = new KidsCraftsAgent();
const coloringBookAgent = new ColoringBookAgent();
const costumePropsAgent = new CostumePropsAgent();

categoryAgentMap.set(CraftCategory.PAPERCRAFT, papercraftAgent);
categoryAgentMap.set(CraftCategory.CLAY, clayAgent);
categoryAgentMap.set(CraftCategory.WOODCRAFT, woodcraftAgent);
categoryAgentMap.set(CraftCategory.JEWELRY, jewelryAgent);
categoryAgentMap.set(CraftCategory.KIDS_CRAFTS, kidsCraftsAgent);
categoryAgentMap.set(CraftCategory.COLORING_BOOK, coloringBookAgent);
categoryAgentMap.set(CraftCategory.COSTUME_PROPS, costumePropsAgent);

/**
 * Get all category agent instances.
 * Used by the orchestrator for bulk registration.
 */
export function getAllCategoryAgents(): CategoryAgentBase[] {
    return Array.from(categoryAgentMap.values());
}

/**
 * Get a specific category agent by category.
 * @param category The craft category
 * @returns The agent for that category, or undefined if not found
 */
export function getCategoryAgent(category: CraftCategory): CategoryAgentBase | undefined {
    return categoryAgentMap.get(category);
}

/**
 * Check if a category has a registered agent.
 */
export function hasCategoryAgent(category: CraftCategory): boolean {
    return categoryAgentMap.has(category);
}
