import styles from "../styles/VideoPlayer.module.css";

// Fixed styles for consistent sizing
const buttonStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "65px",
  height: "65px",
  borderRadius: "50%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  border: "2px solid rgba(255, 255, 255, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 1000,
  padding: 0,
  outline: "none",
  transformOrigin: "right top",
  pointerEvents: "auto",
} as const;

const svgStyle = {
  width: "32px",
  height: "32px",
};

interface MuteButtonProps {
  isMuted: boolean;
  isVisible: boolean;
  onToggleMute: () => void;
}

export const MuteButton: React.FC<MuteButtonProps> = ({
  isMuted,
  isVisible,
  onToggleMute,
}) => {
  return (
    <button
      className={`${styles.muteButton} ${isVisible ? styles.visible : styles.hidden}`}
      onClick={onToggleMute}
      aria-label={isMuted ? "Unmute" : "Mute"}
      title={isMuted ? "Unmute" : "Mute"}
      style={{
        ...buttonStyle,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(50px)",
        transition:
          "opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {isMuted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={svgStyle}
          fill="currentColor"
        >
          <path d="M13 5v14l-5-5H3V10h5l5-5z" />
          <path
            d="M16.59 15.59L18 17l-4-4-4 4 1.41 1.41L14 15.83z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={svgStyle}
          fill="currentColor"
        >
          <path d="M13 5v14l-5-5H3V10h5l5-5z" />
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  );
};
