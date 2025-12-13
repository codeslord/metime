import { AgentBase } from '../a2a/AgentBase';
import { A2AMessage, AgentCard } from '../a2a/types';
import { v4 as uuidv4 } from 'uuid'; // Assumption: uuid is available or I can use a simple random string

/**
 * The Central Orchestrator for the Agent2Agent protocol.
 * Manages agent registration and routes tasks based on capabilities.
 */
export class AgentOrchestrator {
    private agents: Map<string, AgentBase> = new Map();
    private capabilityMap: Map<string, string> = new Map(); // intent -> agentName

    /**
     * Registers an agent with the orchestrator.
     */
    registerAgent(agent: AgentBase) {
        if (this.agents.has(agent.card.name)) {
            console.warn(`Agent ${agent.card.name} is already registered. Overwriting.`);
        }

        this.agents.set(agent.card.name, agent);

        // Index capabilities
        agent.card.capabilities.forEach(cap => {
            if (this.capabilityMap.has(cap.intent)) {
                console.warn(`Capability intent '${cap.intent}' is already handled by ${this.capabilityMap.get(cap.intent)}. Overwriting with ${agent.card.name}.`);
            }
            this.capabilityMap.set(cap.intent, agent.card.name);
        });

        // console.log(`Registered agent: ${agent.card.name} with capabilities: ${agent.card.capabilities.map(c => c.intent).join(', ')}`);
    }

    /**
     * Dispatches a task to the appropriate agent based on the intent.
     * @param intent The specific action intent (e.g., 'generate_craft_image')
     * @param payload The data required for the task
     */
    async dispatch(intent: string, payload: any): Promise<any> {
        const agentName = this.capabilityMap.get(intent);
        if (!agentName) {
            throw new Error(`No agent registered for intent: ${intent}`);
        }

        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ${agentName} not found despite having capability registered.`);
        }

        const taskId = crypto.randomUUID(); // Native browser/node UUID
        const taskMessage: A2AMessage = {
            taskId,
            sender: 'Orchestrator',
            recipient: agentName,
            type: 'TASK_REQUEST',
            payload: { ...payload, intent }, // Include intent in payload for ease of use
            timestamp: Date.now(),
        };

        // console.log(`[Orchestrator] Dispatching ${intent} to ${agentName} (Task ID: ${taskId})`);

        const response = await agent.processTask(taskMessage);

        if (response.type === 'ERROR') {
            throw new Error(response.payload.error || 'Unknown agent error');
        }

        // Unpack the result from the response payload
        return response.payload.result;
    }

    /**
     * Returns a list of all registered agents and their cards.
     */
    getRegistry(): AgentCard[] {
        return Array.from(this.agents.values()).map(a => a.card);
    }
}
