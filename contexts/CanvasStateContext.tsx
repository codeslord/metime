import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Node, Edge, Viewport } from '@xyflow/react';

/**
 * Canvas state stored in memory to persist across navigation.
 * This is separate from saved project state - it's for the current working session.
 */
interface CanvasSessionState {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
    isDirty: boolean; // True if there are unsaved changes
}

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

const DEFAULT_STATE: CanvasSessionState = {
    nodes: [],
    edges: [],
    viewport: DEFAULT_VIEWPORT,
    isDirty: false,
};

interface CanvasStateContextValue {
    /** Current canvas state */
    state: CanvasSessionState;
    /** Update the entire canvas state */
    updateState: (nodes: Node[], edges: Edge[], viewport?: Viewport) => void;
    /** Update just the nodes */
    updateNodes: (nodes: Node[]) => void;
    /** Update just the edges */
    updateEdges: (edges: Edge[]) => void;
    /** Update just the viewport */
    updateViewport: (viewport: Viewport) => void;
    /** Clear the canvas state (explicit clear action) */
    clearState: () => void;
    /** Mark the canvas as saved (resets dirty flag) */
    markAsSaved: () => void;
    /** Check if there are unsaved changes */
    hasUnsavedChanges: () => boolean;
}

const CanvasStateContext = createContext<CanvasStateContextValue | undefined>(undefined);

interface CanvasStateProviderProps {
    children: ReactNode;
}

/**
 * Provider that maintains canvas state in memory across navigation.
 * This ensures that navigating to settings or homepage doesn't lose unsaved work.
 */
export const CanvasStateProvider: React.FC<CanvasStateProviderProps> = ({ children }) => {
    const [state, setState] = useState<CanvasSessionState>(DEFAULT_STATE);

    const updateState = useCallback((nodes: Node[], edges: Edge[], viewport?: Viewport) => {
        setState(prev => ({
            nodes,
            edges,
            viewport: viewport ?? prev.viewport,
            isDirty: true,
        }));
    }, []);

    const updateNodes = useCallback((nodes: Node[]) => {
        setState(prev => ({
            ...prev,
            nodes,
            isDirty: true,
        }));
    }, []);

    const updateEdges = useCallback((edges: Edge[]) => {
        setState(prev => ({
            ...prev,
            edges,
            isDirty: true,
        }));
    }, []);

    const updateViewport = useCallback((viewport: Viewport) => {
        setState(prev => ({
            ...prev,
            viewport,
            // Viewport changes alone don't mark as dirty
        }));
    }, []);

    const clearState = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    const markAsSaved = useCallback(() => {
        setState(prev => ({
            ...prev,
            isDirty: false,
        }));
    }, []);

    const hasUnsavedChanges = useCallback(() => {
        return state.isDirty;
    }, [state.isDirty]);

    const value: CanvasStateContextValue = {
        state,
        updateState,
        updateNodes,
        updateEdges,
        updateViewport,
        clearState,
        markAsSaved,
        hasUnsavedChanges,
    };

    return (
        <CanvasStateContext.Provider value={value}>
            {children}
        </CanvasStateContext.Provider>
    );
};

/**
 * Hook to access the canvas state context.
 * Use this to persist canvas state across navigation.
 */
export const useCanvasState = (): CanvasStateContextValue => {
    const context = useContext(CanvasStateContext);
    if (!context) {
        throw new Error('useCanvasState must be used within a CanvasStateProvider');
    }
    return context;
};
