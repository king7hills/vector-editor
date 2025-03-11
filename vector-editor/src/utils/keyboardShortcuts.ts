import { ToolType } from '../types';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = [];
  private enabled: boolean = true;

  constructor() {
    // Initialize event listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  // Set up standard editor shortcuts
  public setupEditorShortcuts(
    undoFn: () => void,
    redoFn: () => void,
    deleteFn: () => void,
    setTool: (tool: ToolType) => void,
    copyFn: () => void,
    pasteFn: () => void,
    saveFn: () => void,
    zoomInFn: () => void,
    zoomOutFn: () => void,
  ) {
    this.shortcuts = [
      {
        key: 'z',
        ctrl: true,
        description: 'Undo',
        action: undoFn
      },
      {
        key: 'y',
        ctrl: true,
        description: 'Redo',
        action: redoFn
      },
      {
        key: 'z',
        ctrl: true,
        shift: true,
        description: 'Redo (alternative)',
        action: redoFn
      },
      {
        key: 'Delete',
        description: 'Delete selected object',
        action: deleteFn
      },
      {
        key: 'Backspace',
        description: 'Delete selected object (alternative)',
        action: deleteFn
      },
      {
        key: 'v',
        description: 'Select tool',
        action: () => setTool('select')
      },
      {
        key: 'r',
        description: 'Rectangle tool',
        action: () => setTool('rectangle')
      },
      {
        key: 'e',
        description: 'Ellipse tool',
        action: () => setTool('ellipse')
      },
      {
        key: 'l',
        description: 'Line tool',
        action: () => setTool('line')
      },
      {
        key: 'p',
        description: 'Pencil tool',
        action: () => setTool('pencil')
      },
      {
        key: 't',
        description: 'Text tool',
        action: () => setTool('text')
      },
      {
        key: 'h',
        description: 'Pan tool',
        action: () => setTool('pan')
      },
      {
        key: 'c',
        ctrl: true,
        description: 'Copy',
        action: copyFn
      },
      {
        key: 'v',
        ctrl: true,
        description: 'Paste',
        action: pasteFn
      },
      {
        key: 's',
        ctrl: true,
        description: 'Save/Export',
        action: saveFn
      },
      {
        key: '=',
        ctrl: true,
        description: 'Zoom In',
        action: zoomInFn
      },
      {
        key: '-',
        ctrl: true,
        description: 'Zoom Out',
        action: zoomOutFn
      }
    ];
  }

  // Handle keydown events
  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.enabled) return;

    // Skip if user is typing in an input field
    if (this.isUserTyping()) return;

    // Find matching shortcut
    const matchingShortcut = this.shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey); // Support both Ctrl and Command
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      const altMatch = !!shortcut.alt === event.altKey;
      
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  };

  // Check if user is currently typing in an input field
  private isUserTyping(): boolean {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLInputElement 
      || activeElement instanceof HTMLTextAreaElement 
      || activeElement instanceof HTMLSelectElement
      || (activeElement?.getAttribute('contenteditable') === 'true');
  }

  // Add a custom shortcut
  public addShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  // Remove a shortcut
  public removeShortcut(key: string, ctrl?: boolean, shift?: boolean, alt?: boolean): void {
    this.shortcuts = this.shortcuts.filter(shortcut => {
      return !(
        shortcut.key === key && 
        shortcut.ctrl === ctrl && 
        shortcut.shift === shift && 
        shortcut.alt === alt
      );
    });
  }

  // Enable shortcuts
  public enable(): void {
    this.enabled = true;
  }

  // Disable shortcuts
  public disable(): void {
    this.enabled = false;
  }

  // Get all shortcuts for displaying in help
  public getAllShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  // Clean up when component unmounts
  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
} 