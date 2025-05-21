import { forwardRef,useEffect, useRef, useState } from "react";
import Hls from "hls.js";

import styles from "../styles/VideoPlayer.module.css";

interface VideoControlsProps {
  streamKey: string;
  isMuted: boolean;
  isActive: boolean;
  onError: (error: boolean) => void;
  onMuteChange: (isMuted: boolean) => void;
}

export const VideoControls = forwardRef<HTMLVideoElement, VideoControlsProps>(
  ({ streamKey, isActive, onError, onMuteChange, isMuted }, ref) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    // Use the forwarded ref or fall back to local ref
    const videoElement = getVideoElement(ref) || localVideoRef.current;
    const hlsRef = useRef<Hls>(null);

    const [hlsInitialized, setHlsInitialized] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Effect to update HLS when stream key changes
    useEffect(() => {
      if (!videoElement) return;

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
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Always start muted to comply with autoplay policies
          videoElement.muted = true;

          // Start playing
          videoElement
            .play()
            .then(() => {
              setHlsInitialized(true);
            })
            .catch((err) => {
              // Fallback: try playing muted if there's an issue
              if (!videoElement.muted) {
                videoElement.muted = true;
                onMuteChange(true);
                videoElement.play().catch(() => {});
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
      else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = hlsUrl;
        videoElement.muted = true;

        videoElement.addEventListener("loadedmetadata", () => {
          videoElement
            .play()
            .then(() => {
              setHlsInitialized(true);
            })
            .catch((err) => {
              // Fallback: try playing muted if there's an issue
              if (!videoElement.muted) {
                videoElement.muted = true;
                onMuteChange(true);
                videoElement.play().catch(() => {});
              }
            });
        });

        videoElement.addEventListener("error", () => {
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
    }, [streamKey, onError, onMuteChange, videoElement]);

    // Update mute state when active status changes and user has interacted
    useEffect(() => {
      if (videoElement && hlsInitialized) {
        try {
          // Only unmute if active AND user has interacted
          if (isActive && hasInteracted) {
            videoElement.muted = false;
            onMuteChange(false);
          } else {
            videoElement.muted = true;
            onMuteChange(true);
          }

          // Ensure video is playing
          if (videoElement.paused) {
            videoElement.play().catch(() => {});
          }
        } catch (error) {
          // Handle error silently
        }
      }
    }, [isActive, hlsInitialized, hasInteracted, onMuteChange, videoElement]);

    // Set up page-wide interaction listener to enable sound after first interaction
    useEffect(() => {
      const handleFirstInteraction = () => {
        if (!hasInteracted) {
          setHasInteracted(true);

          // Unmute active videos after first interaction
          if (videoElement && isActive) {
            videoElement.muted = false;
            onMuteChange(false);
          }
        }
      };

      // Add listeners to common interaction events
      document.addEventListener("click", handleFirstInteraction);
      document.addEventListener("touchstart", handleFirstInteraction);
      document.addEventListener("keydown", handleFirstInteraction);

      return () => {
        // Clean up listeners
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
      };
    }, [isActive, hasInteracted, onMuteChange, videoElement]);

    // Handle mute/unmute
    useEffect(() => {
      if (videoElement) {
        videoElement.muted = isMuted;
      }
    }, [isMuted, videoElement]);

    return (
      <video
        ref={ref || localVideoRef} // @TODO Definitely needs sorting out
        autoPlay
        playsInline
        muted={isMuted}
        className={styles.video}
      />
    );
  }
);

function getVideoElement(
  ref: React.Ref<HTMLVideoElement> | undefined
): HTMLVideoElement | null {
  if (!ref) return null;
  if (typeof ref === "function") return null; // Can't access .current on a function ref
  return ref.current;
}

VideoControls.displayName = "VideoControls";