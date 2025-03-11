import * as fabric from 'fabric';

// Maximum number of states to store in history
const MAX_HISTORY_LENGTH = 50;

export interface HistoryState {
  canvasState: string;
  timestamp: number;
}

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentStateIndex: number = -1;
  private canvas: fabric.Canvas;
  private isProcessingAction: boolean = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    
    // Save initial state
    this.saveState();
    
    // Add event listeners for canvas changes
    this.setupCanvasListeners();
  }

  private setupCanvasListeners() {
    // Save state after object modifications or canvas changes
    this.canvas.on('object:modified', () => this.saveState());
    this.canvas.on('object:added', () => this.saveState());
    this.canvas.on('object:removed', () => this.saveState());
    this.canvas.on('path:created', () => this.saveState());
  }

  // Save the current canvas state to history
  public saveState() {
    if (this.isProcessingAction) return;

    // Get current canvas state as JSON
    const canvasState = JSON.stringify(this.canvas.toJSON());
    
    // Create history state
    const newState: HistoryState = {
      canvasState,
      timestamp: Date.now()
    };
    
    // If we're not at the end of the history array (user has performed undo),
    // remove future states before adding the new one
    if (this.currentStateIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentStateIndex + 1);
    }
    
    // Add new state to history
    this.history.push(newState);
    this.currentStateIndex = this.history.length - 1;
    
    // Limit history size
    if (this.history.length > MAX_HISTORY_LENGTH) {
      this.history.shift();
      this.currentStateIndex--;
    }
  }

  // Undo the last action
  public undo(): boolean {
    if (this.currentStateIndex <= 0) {
      return false; // Nothing to undo
    }

    this.isProcessingAction = true;
    
    // Move to previous state
    this.currentStateIndex--;
    
    // Load state
    this.loadState(this.history[this.currentStateIndex]);
    
    this.isProcessingAction = false;
    return true;
  }

  // Redo a previously undone action
  public redo(): boolean {
    if (this.currentStateIndex >= this.history.length - 1) {
      return false; // Nothing to redo
    }

    this.isProcessingAction = true;
    
    // Move to next state
    this.currentStateIndex++;
    
    // Load state
    this.loadState(this.history[this.currentStateIndex]);
    
    this.isProcessingAction = false;
    return true;
  }

  // Load a history state
  private loadState(state: HistoryState) {
    // Clear canvas and load from JSON
    this.canvas.clear();
    this.canvas.loadFromJSON(state.canvasState, () => {
      this.canvas.renderAll();
    });
  }

  // Check if undo is available
  public canUndo(): boolean {
    return this.currentStateIndex > 0;
  }

  // Check if redo is available
  public canRedo(): boolean {
    return this.currentStateIndex < this.history.length - 1;
  }

  // Clear history
  public clearHistory() {
    this.history = [];
    this.currentStateIndex = -1;
    this.saveState(); // Save current state as the first entry
  }
} 