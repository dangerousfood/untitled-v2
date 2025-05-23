import { useEffect, useRef, useState } from "react";

import { useSnapEffect } from "@/hooks/useSnapEffect";
import { useVideoSizing } from "@/hooks/useVideoSizing";

import { Chat } from "./Chat";
import { ChatButton } from "./ChatButton";
import { MuteButton } from "./MuteButton";
import { Profile } from "./Profile";
import { SnapButton } from "./SnapButton";
import { VideoControls } from "./VideoControls";

import styles from "../styles/VideoPlayer.module.css";

interface VideoPlayerProps {
  streamKey: string;
  isActive: boolean;
  isMuted: boolean;
  onlyVideoElement?: boolean;
  onMuteChange?: (isMuted: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streamKey,
  isActive,
  isMuted,
  onlyVideoElement = false,
  onMuteChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef(null);
  const [error, setError] = useState(false);
  const [internalMuted, setInternalMuted] = useState(isMuted);
  const [showMuteButton, setShowMuteButton] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showChatButton, setShowChatButton] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Username and profile picture
  const username = `@${streamKey.replace(/[0-9]/g, "")}Streamer`;
  const profilePic = `https://i.pravatar.cc/150?u=${streamKey}`;

  // Use custom hooks - always use for sizing even in onlyVideoElement mode
  const { updateVideoSize } = useVideoSizing(videoRef, videoWrapperRef);

  // Only use snap effects if we're rendering the full component
  const {
    snaps,
    lastSnap,
    showUndoButton,
    undoButtonStyle,
    isAutoResetting,
    handleSnapClick,
    startContinuousSnap,
    stopContinuousSnap,
    handleUndoSnap,
  } = useSnapEffect();

  // Update internal muted state when prop changes
  useEffect(() => {
    setInternalMuted(isMuted);
  }, [isMuted]);

  // Auto-hide profile after a delay - only used in full component mode
  useEffect(() => {
    if (onlyVideoElement) return;

    if (showProfile) {
      // Clear any existing timeout
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }

      // Set new timeout to hide profile after 5 seconds
      profileTimeoutRef.current = setTimeout(() => {
        setShowProfile(false);

        // Hide mute button if video is not muted
        if (!internalMuted) {
          setShowMuteButton(false);
        }
      }, 5000);

      // Show mute button when profile is shown
      setShowMuteButton(true);
    }

    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
    };
  }, [showProfile, internalMuted, onlyVideoElement]);

  // Update mute button visibility when mute state changes - only in full component mode
  useEffect(() => {
    if (onlyVideoElement) return;

    // Always show the mute button when the video is muted
    if (internalMuted) {
      setShowMuteButton(true);
    } else if (!showProfile) {
      // Only hide the mute button if the profile isn't shown
      setShowMuteButton(false);
    }
  }, [internalMuted, showProfile, onlyVideoElement]);

  // Force update video sizing on mount and when active state changes
  useEffect(() => {
    updateVideoSize();

    // Set up a resize handler for more responsive sizing
    const handleResize = () => {
      updateVideoSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isActive, updateVideoSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
    };
  }, []);

  // Handle mute toggle
  const handleToggleMute = () => {
    const newMutedState = !internalMuted;
    setInternalMuted(newMutedState);
    if (onMuteChange) {
      onMuteChange(newMutedState);
    }
  };

  // Handle chat button click
  const handleChatClick = () => {
    if (onlyVideoElement) return;

    const newChatState = !showChat;
    setShowChat(newChatState);

    // Toggle chat button visibility - hide when chat is open
    setShowChatButton(!newChatState);

    // If opening chat, hide the profile popup
    if (newChatState) {
      setShowProfile(false);
    } else {
      // If closing chat, show the profile popup
      setShowProfile(true);
      setShowMuteButton(true);
    }
  };

  // Toggle follow state
  const handleToggleFollow = () => {
    if (onlyVideoElement) return;

    setIsFollowing((prev) => !prev);
  };

  // Handle clicking on the video
  const handleVideoClick = (e: React.SyntheticEvent) => {
    // If we're only rendering the video element, skip interaction handling
    if (onlyVideoElement) return;

    // Don't process clicks on buttons or UI elements
    if ((e.target as HTMLElement).closest('[data-ui-element="true"]')) {
      return;
    }

    // Close chat if it's open
    if (showChat) {
      setShowChat(false);
      setShowProfile(true);
      setShowMuteButton(true);
      setShowChatButton(true);
      return;
    }

    // Toggle profile popup
    setShowProfile((prev) => !prev);
  };

  // Handle chat close
  const handleChatClose = () => {
    if (onlyVideoElement) return;

    // Close chat and show profile
    setShowChat(false);
    setShowProfile(true);
    setShowMuteButton(true);
    setShowChatButton(true);
  };

  // If only rendering the video element without UI
  if (onlyVideoElement) {
    return (
      <div className={styles.videoWrapper} ref={videoWrapperRef}>
        <VideoControls
          streamKey={streamKey}
          isActive={isActive}
          onError={setError}
          onMuteChange={setInternalMuted}
          isMuted={internalMuted}
          ref={videoRef}
        />

        {error && (
          <div className={styles.errorMessage}>Stream not available</div>
        )}
      </div>
    );
  }

  // Full video player with UI
  return (
    <div
      className={styles.videoWrapper}
      ref={videoWrapperRef}
      onClick={handleVideoClick}
    >
      {/* Video element */}
      <VideoControls
        streamKey={streamKey}
        isActive={isActive}
        onError={setError}
        onMuteChange={setInternalMuted}
        isMuted={internalMuted}
        ref={videoRef}
      />

      {/* Error message */}
      {error && <div className={styles.errorMessage}>Stream not available</div>}

      {/* UI Container */}
      <div className={styles.videoUIContainer} data-ui-container="true">
        {/* Profile component */}
        {showProfile && (
          <Profile
            username={username}
            profilePic={profilePic}
            isFollowing={isFollowing}
            onToggleFollow={handleToggleFollow}
          />
        )}

        {/* Snap button component */}
        <div data-ui-element="true">
          <SnapButton
            onSnap={handleSnapClick}
            onContinuousSnap={startContinuousSnap}
            onStopContinuousSnap={stopContinuousSnap}
            snapNumbers={snaps}
            lastSnap={lastSnap}
            isAutoResetting={isAutoResetting}
            onUndoSnap={handleUndoSnap}
            showUndoButton={showUndoButton}
            undoButtonStyle={undoButtonStyle}
          />
        </div>

        {/* Mute button component */}
        <div data-ui-element="true">
          <MuteButton
            isMuted={internalMuted}
            isVisible={showMuteButton}
            onToggleMute={handleToggleMute}
          />
        </div>

        {/* Chat button component */}
        <div data-ui-element="true">
          <ChatButton isVisible={showChatButton} onClick={handleChatClick} />
        </div>

        {/* Chat component */}
        {showChat && <Chat onClose={handleChatClose} />}
      </div>
    </div>
  );
};

export default VideoPlayer;
