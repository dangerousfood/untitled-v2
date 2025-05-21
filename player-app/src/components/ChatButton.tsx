import { useRef } from "react";

import styles from "../styles/VideoPlayer.module.css";

// Fixed styles for consistent sizing
const containerStyle = {
  position: "fixed",
  bottom: "120px",
  right: "110px",
  width: "81px",
  height: "81px",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "auto",
} as const;

const buttonStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "81px",
  height: "81px",
  borderRadius: "50%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  border: "2px solid rgba(255, 255, 255, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  outline: "none",
  overflow: "hidden",
  zIndex: 15,
} as const;

const imgStyle = {
  width: "40px",
  height: "40px",
  objectFit: "contain",
} as const;

interface ChatButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  isVisible,
  onClick,
}) => {
  const chatButtonRef = useRef(null);

  return (
    <div
      className={`${styles.chatButtonContainer} ${!isVisible ? styles.hidden : ""}`}
      ref={chatButtonRef}
      style={{
        ...containerStyle,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.8)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <button
        className={styles.chatButton}
        onClick={onClick}
        title="Chat"
        style={buttonStyle}
      >
        <img src="/bubble.svg" alt="Chat" style={imgStyle} />
      </button>
    </div>
  );
};
