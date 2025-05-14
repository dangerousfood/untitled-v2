import { useEffect, useRef, useState } from 'react';
import styles from '../styles/VideoPlayer.module.css';
import Chat from './Chat';
import Profile from './Profile';
import MuteButton from './MuteButton';
import ChatButton from './ChatButton';
import SnapButton from './SnapButton';
import VideoControls from './VideoControls';
import useSnapEffect from '../hooks/useSnapEffect';
import useVideoSizing from '../hooks/useVideoSizing';

const VideoPlayer = ({ streamKey, isActive = false }) => {
  const videoRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const [error, setError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showChatButton, setShowChatButton] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const profileTimeoutRef = useRef(null);
  
  // Username and profile picture
  const username = `@${streamKey.replace(/[0-9]/g, '')}Streamer`;
  const profilePic = `https://i.pravatar.cc/150?u=${streamKey}`;
  
  // Use custom hooks
  const { updateVideoSize } = useVideoSizing(videoRef, videoWrapperRef);
  const {
    snapCount,
    snaps,
    lastSnap,
    showUndoButton,
    undoButtonStyle,
    isAutoResetting,
    handleSnapClick,
    startContinuousSnap,
    stopContinuousSnap,
    handleUndoSnap
  } = useSnapEffect();
  
  // Auto-hide profile after a delay
  useEffect(() => {
    if (showProfile) {
      // Clear any existing timeout
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
      
      // Set new timeout to hide profile after 5 seconds
      profileTimeoutRef.current = setTimeout(() => {
        setShowProfile(false);
        
        // Hide mute button if video is not muted
        if (!isMuted) {
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
  }, [showProfile, isMuted]);

  // Update mute button visibility when mute state changes
  useEffect(() => {
    // Always show the mute button when the video is muted
    if (isMuted) {
      setShowMuteButton(true);
    } else if (!showProfile) {
      // Only hide the mute button if the profile isn't shown
      setShowMuteButton(false);
    }
  }, [isMuted, showProfile]);
  
  // Force update video sizing on mount and when active state changes
  useEffect(() => {
    updateVideoSize();
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
  const handleToggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Handle chat button click
  const handleChatClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
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
  const handleToggleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing(prev => !prev);
  };
  
  // Handle clicking on the video
  const handleVideoClick = (e) => {
    // Don't process clicks on buttons or UI elements
    if (e.target.closest('[data-ui-element="true"]')) {
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
    setShowProfile(prev => !prev);
  };
  
  // Handle chat close
  const handleChatClose = (e) => {
    e.stopPropagation();
    // Close chat and show profile
    setShowChat(false);
    setShowProfile(true);
    setShowMuteButton(true);
    setShowChatButton(true); 
  };

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
        onMuteChange={setIsMuted}
        isMuted={isMuted}
        ref={videoRef}
      />
      
      {/* Error message */}
      {error && (
        <div className={styles.errorMessage}>
          Stream not available
        </div>
      )}
      
      {/* UI Container */}
      <div 
        className={styles.videoUIContainer} 
        data-ui-container="true"
      >
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
            snapCount={snapCount}
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
            isMuted={isMuted}
            isVisible={showMuteButton}
            onToggleMute={handleToggleMute}
          />
        </div>
        
        {/* Chat button component */}
        <div data-ui-element="true">
          <ChatButton
            isVisible={showChatButton}
            onClick={handleChatClick}
          />
        </div>
        
        {/* Chat component */}
        {showChat && (
          <Chat 
            onClose={handleChatClose}
            username={username}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer; 