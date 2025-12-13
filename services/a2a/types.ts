/**
 * Agent2Agent Protocol Types
 * Defines the standard message envelopes and capability cards for agent communication.
 */

export interface AgentCapability {
    intent: string;
    description: string;
    inputSchema?: any; // JSON Schema or detailed object description
}

export interface AgentCard {
    name: string;
    version: string;
    description: string;
    capabilities: AgentCapability[];
}

export type MessageType = 'TASK_REQUEST' | 'TASK_RESPONSE' | 'ERROR' | 'STATUS_UPDATE';

export interface A2AMessage {
    taskId: string;
    sender: string;
    recipient: string; // 'orchestrator' or specific agent name
    type: MessageType;
    payload: any;
    timestamp: number;
}
