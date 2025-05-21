import { useEffect,useRef, useState } from "react";

import { Chat } from "./Chat";
import { Profile } from "./Profile";

import styles from "../styles/ControlsOverlay.module.css";

interface ControlsOverlayProps {
  username?: string;
  profilePic?: string;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  username = "",
  profilePic = "",
}) => {
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout>(null);
  const overlayRef = useRef(null);

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
      }, 5000);
    }

    return () => {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
    };
  }, [showProfile]);

  // Toggle follow state
  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  // Handle clicking on the overlay
  const handleOverlayClick = (e: React.SyntheticEvent<HTMLElement>) => {
    // Don't process clicks on buttons or UI elements
    if ((e.target as HTMLElement).closest('[data-ui-element="true"]')) {
      return;
    }

    // Close chat if it's open
    if (showChat) {
      setShowChat(false);
      setShowProfile(true);

      return;
    }

    // Toggle profile popup
    setShowProfile((prev) => !prev);
  };

  // Handle chat close
  const handleChatClose = () => {
    setShowChat(false);
    setShowProfile(true);
  };

  // Show profile on first render to make it visible initially
  useEffect(() => {
    // Force profile to show on first render
    setShowProfile(true);

    // Listen for chat toggle requests from other components
    const handleToggleChatRequest = () => {
      const newChatState = !showChat;
      setShowChat(newChatState);

      if (newChatState) {
        setShowProfile(false);
      } else {
        setShowProfile(true);
      }
    };

    document.addEventListener("toggleChatRequest", handleToggleChatRequest);

    return () => {
      document.removeEventListener(
        "toggleChatRequest",
        handleToggleChatRequest
      );
    };
  }, [showChat]);

  // Add console.log for debugging
  console.log("ControlsOverlay rendering, showProfile:", showProfile);

  return (
    <div
      className={styles.controlsOverlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      data-fixed-overlay="true"
    >
      {/* Profile component - force some inline styles */}
      {showProfile && (
        <div
          className="profileContainer"
          data-ui-element="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 200,
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 80%, transparent 100%)",
            padding: "20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Profile
            username={username}
            profilePic={profilePic}
            isFollowing={isFollowing}
            onToggleFollow={handleToggleFollow}
          />
        </div>
      )}

      {/* Chat component */}
      {showChat && (
        <div
          className="chatContainer"
          data-ui-element="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 200,
          }}
        >
          <Chat onClose={handleChatClose} />
        </div>
      )}
    </div>
  );
};
