import { useState, useEffect } from 'react';

export function useViewportHeight(isActive: boolean = true) {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) return;

    const updateViewportHeight = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const initialHeight = window.innerHeight;
      
      setViewportHeight(currentHeight);
      
      // Detect keyboard based on height difference
      // If viewport is significantly smaller than initial height, keyboard is likely open
      const heightDiff = initialHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 150); // 150px threshold for keyboard detection
    };

    // Initial measurement
    updateViewportHeight();

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      return () => window.visualViewport?.removeEventListener('resize', updateViewportHeight);
    } else {
      window.addEventListener('resize', updateViewportHeight);
      return () => window.removeEventListener('resize', updateViewportHeight);
    }
  }, [isActive]);

  return { viewportHeight, isKeyboardOpen };
}