import { useEffect, useCallback } from 'react';

const useVideoSizing = (videoRef: React.RefObject<HTMLElement>, wrapperRef: React.RefObject<HTMLElement>) => {
  const updateVideoSize = useCallback(() => {
    if (!videoRef.current || !wrapperRef.current) return;
    
    // For landscape screens, force letterboxing to maintain 9:16
    if (window.innerWidth > window.innerHeight * (9/16)) {
      // Always use full window height without limiting
      const height = window.innerHeight;
      const aspectRatioWidth = height * (9/16);
      // Ensure minimum width of 375px
      const finalWidth = Math.max(aspectRatioWidth, 375);
      
      videoRef.current.style.height = `${height}px`;
      videoRef.current.style.width = `${finalWidth}px`;
      videoRef.current.style.objectFit = 'contain';
      
      // Set data attributes on the wrapper based on the actual video width
      wrapperRef.current.setAttribute('data-video-width', Math.round(finalWidth).toString());
      
      // Also set width as a CSS variable for more precise responsive adjustments
      wrapperRef.current.style.setProperty('--video-width', `${Math.round(finalWidth)}px`);
      wrapperRef.current.style.setProperty('--video-height', `${Math.round(height)}px`);
      
      // Set size category based on actual video width
      if (finalWidth <= 400) {
        wrapperRef.current.setAttribute('data-video-size', 'xs');
      } else if (finalWidth <= 500) {
        wrapperRef.current.setAttribute('data-video-size', 'sm');
      } else if (finalWidth <= 700) {
        wrapperRef.current.setAttribute('data-video-size', 'md');
      } else {
        wrapperRef.current.setAttribute('data-video-size', 'lg');
      }
      
      // Update UI container to match video dimensions
      const uiContainer: HTMLElement | null = wrapperRef.current.querySelector('[data-ui-container="true"]');
      if (uiContainer) {
        uiContainer.style.height = `${height}px`;
        uiContainer.style.width = `${finalWidth}px`;
        uiContainer.style.left = '50%';
        uiContainer.style.transform = 'translateX(-50%)';
      }
    } else {
      // For portrait or matching screens, use cover and full viewport height
      const height = window.innerHeight;
      const viewportWidth = Math.max(window.innerWidth, 375);
      
      videoRef.current.style.width = `${viewportWidth}px`;
      videoRef.current.style.height = `${height}px`;
      videoRef.current.style.objectFit = 'cover';
      
      // For portrait mode, use actual viewport width for sizing decisions
      wrapperRef.current.setAttribute('data-video-width', Math.round(viewportWidth).toString());
      
      // Also set width as a CSS variable for more precise responsive adjustments
      wrapperRef.current.style.setProperty('--video-width', `${Math.round(viewportWidth)}px`);
      wrapperRef.current.style.setProperty('--video-height', `${Math.round(height)}px`);
      
      // Set size category based on viewport width
      if (viewportWidth <= 400) {
        wrapperRef.current.setAttribute('data-video-size', 'xs');
      } else if (viewportWidth <= 500) {
        wrapperRef.current.setAttribute('data-video-size', 'sm');
      } else if (viewportWidth <= 700) {
        wrapperRef.current.setAttribute('data-video-size', 'md');
      } else {
        wrapperRef.current.setAttribute('data-video-size', 'lg');
      }
      
      // Reset UI container to full width
      const uiContainer: HTMLElement | null = wrapperRef.current.querySelector('[data-ui-container="true"]');
      if (uiContainer) {
        uiContainer.style.height = `${height}px`;
        uiContainer.style.width = '100%';
        uiContainer.style.minWidth = '375px';
        uiContainer.style.left = '0';
        uiContainer.style.transform = 'none';
      }
    }
  }, [videoRef, wrapperRef]);

  useEffect(() => {
    // Call immediately and on resize
    updateVideoSize();
    
    // Add event listeners
    window.addEventListener('resize', updateVideoSize);
    window.addEventListener('orientationchange', updateVideoSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateVideoSize);
      window.removeEventListener('orientationchange', updateVideoSize);
    };
  }, [updateVideoSize]);

  return { updateVideoSize };
};

export default useVideoSizing; 