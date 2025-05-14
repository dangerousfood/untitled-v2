import { useEffect, useRef, useState, forwardRef } from 'react';
import Hls from 'hls.js';
import styles from '../styles/VideoPlayer.module.css';

const VideoControls = forwardRef(({ streamKey, isActive, onError, onMuteChange, isMuted }, ref) => {
  const localVideoRef = useRef(null);
  // Use the forwarded ref or fall back to local ref
  const videoRef = ref || localVideoRef;
  const hlsRef = useRef(null);
  const [hlsInitialized, setHlsInitialized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Effect to update HLS when stream key changes
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setHlsInitialized(false);
    
    const hlsUrl = `/hls/${streamKey}.m3u8`;
    
    // Use HLS.js if supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Always start muted to comply with autoplay policies
        videoRef.current.muted = true;
        
        // Start playing
        videoRef.current.play().then(() => {
          setHlsInitialized(true);
        }).catch(err => {
          // Fallback: try playing muted if there's an issue
          if (!videoRef.current.muted) {
            videoRef.current.muted = true;
            onMuteChange(true);
            videoRef.current.play().catch(() => {});
          }
        });
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          onError(true);
          hls.destroy();
        }
      });
      
      hlsRef.current = hls;
    } 
    // For Safari which has native HLS support
    else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = hlsUrl;
      videoRef.current.muted = true;
      
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().then(() => {
          setHlsInitialized(true);
        }).catch(err => {
          // Fallback: try playing muted if there's an issue
          if (!videoRef.current.muted) {
            videoRef.current.muted = true;
            onMuteChange(true);
            videoRef.current.play().catch(() => {});
          }
        });
      });
      
      videoRef.current.addEventListener('error', () => {
        onError(true);
      });
    } else {
      onError(true);
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamKey, onError, onMuteChange, videoRef]);

  // Update mute state when active status changes and user has interacted
  useEffect(() => {
    if (videoRef.current && hlsInitialized) {
      try {
        // Only unmute if active AND user has interacted
        if (isActive && hasInteracted) {
          videoRef.current.muted = false;
          onMuteChange(false);
        } else {
          videoRef.current.muted = true;
          onMuteChange(true);
        }
        
        // Ensure video is playing
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      } catch (error) {
        // Handle error silently
      }
    }
  }, [isActive, hlsInitialized, hasInteracted, onMuteChange, videoRef]);
  
  // Set up page-wide interaction listener to enable sound after first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        
        // Unmute active videos after first interaction
        if (videoRef.current && isActive) {
          videoRef.current.muted = false;
          onMuteChange(false);
        }
      }
    };
    
    // Add listeners to common interaction events
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      // Clean up listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isActive, hasInteracted, onMuteChange, videoRef]);
  
  // Handle mute/unmute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoRef]);
  
  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline
      muted={isMuted}
      className={styles.video}
    />
  );
});

export default VideoControls; 