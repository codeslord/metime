import { AgentCard, A2AMessage } from './types';

/**
 * Abstract base class for all A2A agents.
 * exact enforcement of the Agent2Agent protocol.
 */
export abstract class AgentBase {
    /**
     * The Agent Card describing this agent's identity and capabilities.
     */
    abstract readonly card: AgentCard;

    /**
     * Processes an incoming task message.
     * @param task The task request message
     * @returns A promise resolving to the response message
     */
    abstract processTask(task: A2AMessage): Promise<A2AMessage>;

    /**
     * Helper to create a standard success response.
     */
    protected createResponse(originalTask: A2AMessage, payload: any): A2AMessage {
        return {
            taskId: originalTask.taskId,
            sender: this.card.name,
            recipient: originalTask.sender,
            type: 'TASK_RESPONSE',
            payload,
            timestamp: Date.now(),
        };
    }

    /**
     * Helper to create a standard error response.
     */
    protected createErrorResponse(originalTask: A2AMessage, error: string): A2AMessage {
        return {
            taskId: originalTask.taskId,
            sender: this.card.name,
            recipient: originalTask.sender,
            type: 'ERROR',
            payload: { error },
            timestamp: Date.now(),
        };
    }
}
