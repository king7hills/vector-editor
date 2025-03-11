import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;          // The key to listen for (e.g., 'a', 'b', 'Delete')
  action: () => void;   // The function to execute when the shortcut is triggered
  ctrl?: boolean;       // Whether Ctrl key must be pressed
  shift?: boolean;      // Whether Shift key must be pressed
  alt?: boolean;        // Whether Alt key must be pressed
  preventDefault?: boolean; // Whether to prevent the default browser action
}

/**
 * A hook to handle keyboard shortcuts in a React component
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Skip if focus is in an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement ||
        (document.activeElement?.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      // Find the matching shortcut
      const matchingShortcut = shortcuts.find(
        (shortcut) => 
          // Match the key (case-insensitive)
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          // Match modifier keys (Ctrl/Command)
          (!!shortcut.ctrl === (event.ctrlKey || event.metaKey)) &&
          // Match Shift key
          (!!shortcut.shift === event.shiftKey) &&
          // Match Alt key
          (!!shortcut.alt === event.altKey)
      );

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
};

export default useKeyboardShortcuts; 