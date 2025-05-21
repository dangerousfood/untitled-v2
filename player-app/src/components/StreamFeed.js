"use client";

import { useState, useEffect, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import ControlsOverlay from "./ControlsOverlay";
import SnapButton from "./SnapButton";
import ChatButton from "./ChatButton";
import MuteButton from "./MuteButton";
import { useSnapEffect } from "@/hooks/useSnapEffect";
import styles from "../styles/StreamFeed.module.css";

const StreamFeed = ({ streams = ["stream1", "stream2", "stream3"] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const swipeInProgress = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTime = useRef(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);

  // Use snap effect hook directly
  const snapEffectProps = useSnapEffect();

  // Get current stream details
  const currentStreamKey = streams[currentIndex];
  const username = `@${currentStreamKey.replace(/[0-9]/g, "")}Streamer`;
  const profilePic = `https://i.pravatar.cc/150?u=${currentStreamKey}`;

  // Handle mute button toggle
  const handleMuteChange = (newMutedState) => {
    setIsMuted(newMutedState);
  };

  // Determine which streams should be rendered to prevent freezing during transitions
  const getVisibleStreams = () => {
    if (!streams.length) return [];

    const visibleIndexes = new Set();
    // Always include current stream
    visibleIndexes.add(currentIndex);

    // Include adjacent streams for continuous playback during transitions
    const prevIndex = (currentIndex - 1 + streams.length) % streams.length;
    const nextIndex = (currentIndex + 1) % streams.length;

    visibleIndexes.add(prevIndex);
    visibleIndexes.add(nextIndex);

    // For looping cases, also include wrap-around indexes
    if (streams.length > 2) {
      if (currentIndex === 0) {
        visibleIndexes.add(streams.length - 1); // Last stream for loop-back
      } else if (currentIndex === streams.length - 1) {
        visibleIndexes.add(0); // First stream for loop-back
      }
    }

    return Array.from(visibleIndexes);
  };

  const goToNextStream = () => {
    // Always move forward to the next stream, looping back to start if needed
    const nextIndex = (currentIndex + 1) % streams.length;
    setCurrentIndex(nextIndex);
  };

  const goToPrevStream = () => {
    // Always move backward to previous stream, looping to end if needed
    const prevIndex = (currentIndex - 1 + streams.length) % streams.length;
    setCurrentIndex(prevIndex);
  };

  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    // Skip if the touch is on a fixed overlay element
    if (
      e.target.closest('[data-fixed-overlay="true"], [data-ui-element="true"]')
    )
      return;
    touchStartY.current = e.touches[0].clientY;
    swipeInProgress.current = true;
  };

  const handleTouchMove = (e) => {
    if (!swipeInProgress.current || isTransitioning) return;
    // Skip if the touch is on a fixed overlay element
    if (
      e.target.closest('[data-fixed-overlay="true"], [data-ui-element="true"]')
    )
      return;
    touchEndY.current = e.touches[0].clientY;

    // Prevent default to stop browser scroll
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!swipeInProgress.current || isTransitioning) return;
    // Skip if the touch is on a fixed overlay element
    if (
      e.target.closest('[data-fixed-overlay="true"], [data-ui-element="true"]')
    )
      return;

    // Minimum swipe distance required (px)
    const minSwipeDistance = 50;
    const swipeDistance = touchStartY.current - touchEndY.current;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      setIsTransitioning(true);
      if (swipeDistance > 0) {
        // Swipe up - always go to next stream (loop to first if at end)
        goToNextStream();
      } else {
        // Swipe down - always go to previous stream (loop to last if at beginning)
        goToPrevStream();
      }

      // Reset transition lock after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition duration
    }

    swipeInProgress.current = false;
  };

  const handleWheel = (e) => {
    // Return early if we're already transitioning
    if (isTransitioning) return;

    // Skip if the wheel event is on a fixed overlay element
    if (
      e.target.closest('[data-fixed-overlay="true"], [data-ui-element="true"]')
    )
      return;

    // Prevent default to stop browser scroll
    e.preventDefault();

    // More responsive wheel sensitivity
    const scrollThreshold = 40; // Lowered from 100 to make scrolling more responsive
    const cooldownPeriod = 400; // Reduced cooldown period for better response

    const now = Date.now();

    // If we're within the cooldown period, accumulate scroll instead of debouncing
    if (now - lastScrollTime.current < cooldownPeriod) {
      return;
    }

    // Check if the wheel delta exceeds the threshold
    if (Math.abs(e.deltaY) > scrollThreshold) {
      // Handle scroll immediately if it's a clear scroll intent
      setIsTransitioning(true);
      lastScrollTime.current = now;

      if (e.deltaY > 0) {
        // Scroll down - go to next stream
        goToNextStream();
      } else {
        // Scroll up - go to previous stream
        goToPrevStream();
      }

      // Reset transition lock after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  };

  useEffect(() => {
    // Lock body scroll when component mounts
    document.body.style.overflow = "hidden";

    return () => {
      // Restore body scroll when component unmounts
      document.body.style.overflow = "";

      // Clear any pending timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Get which streams should be visible
  const visibleIndexes = getVisibleStreams();

  console.log(
    "StreamFeed rendering, current user:",
    username,
    "profile pic:",
    profilePic
  );

  return (
    <>
      <div
        className={styles.feedContainer}
        ref={feedRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className={styles.feedSlider}
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {streams.map((streamKey, index) => {
            // Determine if this stream should be rendered
            const shouldRender = visibleIndexes.includes(index);

            // Only the current stream should be active (unmuted)
            const isActive = index === currentIndex;

            return (
              <div key={streamKey} className={styles.feedItem}>
                {shouldRender && (
                  <VideoPlayer
                    streamKey={streamKey}
                    isActive={isActive}
                    isMuted={isMuted}
                    onlyVideoElement={true} // Signal that this should only render video, not controls
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.navigation}>
          <div
            className={`${styles.navArrow} ${styles.navUp}`}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                goToPrevStream();
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
          >
            ▲
          </div>

          <div
            className={`${styles.navArrow} ${styles.navDown}`}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                goToNextStream();
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
          >
            ▼
          </div>
        </div>
      </div>

      {/* Fixed overlay for profile and chat */}
      <ControlsOverlay
        username={username}
        profilePic={profilePic}
        isMuted={isMuted}
        onMuteChange={handleMuteChange}
        activeStreamKey={currentStreamKey}
        key={currentIndex}
      />

      {/* Fixed controls */}
      <div
        data-ui-element="true"
        style={{
          position: "fixed",
          bottom: "120px",
          right: "20px",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <SnapButton
          onSnap={snapEffectProps.handleSnapClick}
          onContinuousSnap={snapEffectProps.startContinuousSnap}
          onStopContinuousSnap={snapEffectProps.stopContinuousSnap}
          snapCount={snapEffectProps.snapCount}
          snapNumbers={snapEffectProps.snaps}
          lastSnap={snapEffectProps.lastSnap}
          isAutoResetting={snapEffectProps.isAutoResetting}
          onUndoSnap={snapEffectProps.handleUndoSnap}
          showUndoButton={snapEffectProps.showUndoButton}
          undoButtonStyle={snapEffectProps.undoButtonStyle}
        />
      </div>

      <div
        data-ui-element="true"
        style={{
          position: "fixed",
          bottom: "120px",
          right: "110px",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <ChatButton
          isVisible={true}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            // Show chat in the overlay by triggering a custom event
            const customEvent = new CustomEvent("toggleChatRequest");
            document.dispatchEvent(customEvent);
          }}
        />
      </div>

      <div
        data-ui-element="true"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <MuteButton
          isMuted={isMuted}
          isVisible={true}
          onToggleMute={(e) => {
            e.stopPropagation();
            handleMuteChange(!isMuted);
          }}
        />
      </div>
    </>
  );
};

export default StreamFeed;
