import { useState, useCallback, useEffect, useRef } from 'react';
import * as fabric from 'fabric';

// Maximum number of states to store in history
const MAX_HISTORY_LENGTH = 50;

interface HistoryState {
  json: string;
  timestamp: number;
}

/**
 * A hook to manage undo/redo history for a Fabric.js canvas
 */
export const useHistory = (canvas: fabric.Canvas | null) => {
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  
  // Use refs to avoid re-renders when history changes
  const historyRef = useRef<HistoryState[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isProcessingHistoryRef = useRef<boolean>(false);
  
  // Save the current canvas state
  const saveState = useCallback(() => {
    if (!canvas || isProcessingHistoryRef.current) return;
    
    try {
      const json = JSON.stringify(canvas.toJSON());
      const newState: HistoryState = {
        json,
        timestamp: Date.now()
      };
      
      // If we're not at the end of the history array (user has performed undo),
      // remove future states before adding the new one
      if (currentIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
      }
      
      // Add the new state to history
      historyRef.current.push(newState);
      currentIndexRef.current = historyRef.current.length - 1;
      
      // Limit history size
      if (historyRef.current.length > MAX_HISTORY_LENGTH) {
        historyRef.current.shift();
        currentIndexRef.current--;
      }
      
      // Update undo/redo availability
      setCanUndo(currentIndexRef.current > 0);
      setCanRedo(false);
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }
  }, [canvas]);
  
  // Undo the last action
  const undo = useCallback(() => {
    if (!canvas || !canUndo || currentIndexRef.current <= 0) return;
    
    try {
      isProcessingHistoryRef.current = true;
      
      // Move to previous state
      currentIndexRef.current--;
      
      // Load state
      const state = historyRef.current[currentIndexRef.current];
      canvas.loadFromJSON(state.json, canvas.renderAll.bind(canvas));
      
      // Update undo/redo availability
      setCanUndo(currentIndexRef.current > 0);
      setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
      
      isProcessingHistoryRef.current = false;
    } catch (error) {
      console.error('Error applying undo:', error);
      isProcessingHistoryRef.current = false;
    }
  }, [canvas, canUndo]);
  
  // Redo a previously undone action
  const redo = useCallback(() => {
    if (!canvas || !canRedo || currentIndexRef.current >= historyRef.current.length - 1) return;
    
    try {
      isProcessingHistoryRef.current = true;
      
      // Move to next state
      currentIndexRef.current++;
      
      // Load state
      const state = historyRef.current[currentIndexRef.current];
      canvas.loadFromJSON(state.json, canvas.renderAll.bind(canvas));
      
      // Update undo/redo availability
      setCanUndo(currentIndexRef.current > 0);
      setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
      
      isProcessingHistoryRef.current = false;
    } catch (error) {
      console.error('Error applying redo:', error);
      isProcessingHistoryRef.current = false;
    }
  }, [canvas, canRedo]);
  
  // Set up canvas event listeners for history tracking
  useEffect(() => {
    if (!canvas) return;
    
    const handleHistoryEvent = () => {
      if (!isProcessingHistoryRef.current) {
        saveState();
      }
    };
    
    // Save initial state
    saveState();
    
    // Attach event listeners for actions that should trigger history updates
    canvas.on('object:modified', handleHistoryEvent);
    canvas.on('object:added', handleHistoryEvent);
    canvas.on('object:removed', handleHistoryEvent);
    canvas.on('path:created', handleHistoryEvent);
    
    return () => {
      // Clean up event listeners
      canvas.off('object:modified', handleHistoryEvent);
      canvas.off('object:added', handleHistoryEvent);
      canvas.off('object:removed', handleHistoryEvent);
      canvas.off('path:created', handleHistoryEvent);
    };
  }, [canvas, saveState]);
  
  // Clear history
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    
    // Save current state as first entry
    saveState();
    
    setCanUndo(false);
    setCanRedo(false);
  }, [saveState]);
  
  return {
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    clearHistory
  };
};

export default useHistory; 