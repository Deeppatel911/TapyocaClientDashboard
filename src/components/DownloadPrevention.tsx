import { useEffect } from 'react';

export const DownloadPrevention = () => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts for downloading/saving
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12, etc.
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'a')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'Delete')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Detect screen recording (basic detection)
    const detectScreenRecording = () => {
      if ('getDisplayMedia' in navigator.mediaDevices) {
        // This is a basic check and may not catch all screen recording methods
        console.warn('Screen sharing API detected - content may be recorded');
      }
    };

    detectScreenRecording();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return null; // This component doesn't render anything
};