import { useRef } from "react";

import styles from "../styles/VideoPlayer.module.css";

// Fixed styles for consistent sizing
const containerStyle = {
  position: "fixed",
  bottom: "120px",
  right: "20px",
  width: "81px",
  height: "200px",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  pointerEvents: "auto",
} as const;

const buttonWrapperStyle = {
  position: "relative",
  width: "81px",
  height: "81px",
  zIndex: 10,
} as const;

const snapButtonStyle = {
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

const snapButtonImgStyle = {
  width: "54px",
  height: "54px",
  objectFit: "contain",
} as const;

interface SnapButtonProps {
  snapNumbers: Snap[];
  lastSnap: Snap | null;
  isAutoResetting: boolean;
  showUndoButton: boolean;
  undoButtonStyle: React.CSSProperties; // @TODO Fix this type
  onSnap: () => void;
  onContinuousSnap: (e: React.SyntheticEvent) => void;
  onStopContinuousSnap: () => void;
  onUndoSnap: () => void;
}

export interface Snap {
  count: number;
  id: number;
  timestamp: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

export const SnapButton: React.FC<SnapButtonProps> = ({
  snapNumbers,
  lastSnap,
  isAutoResetting,
  showUndoButton,
  undoButtonStyle,
  onSnap,
  onContinuousSnap,
  onStopContinuousSnap,
  onUndoSnap,
}) => {
  const snapButtonRef = useRef(null);

  return (
    <div
      className={styles.snapButtonContainer}
      ref={snapButtonRef}
      onMouseLeave={onStopContinuousSnap}
      style={containerStyle}
    >
      {/* Regular animated snaps */}
      {Array.isArray(snapNumbers)
        ? snapNumbers
            .filter((snap) => {
              // During auto-reset, show all snaps as animated
              if (isAutoResetting) {
                return true;
              }
              // During undo, only show snaps that aren't the lastSnap
              return !lastSnap || snap.id !== lastSnap.id;
            })
            .map((snap) => (
              <div
                key={snap.id}
                className={styles.snapNumber}
                style={{
                  top: `${snap.y}px`,
                  animationDuration: "2.5s",
                  transform: `translateX(-50%) rotate(${snap.rotate}deg)`,
                  color: snap.color,
                }}
              >
                +{snap.count}
              </div>
            ))
        : null}

      {/* Last snap shown without animation - only if not in auto-reset */}
      {lastSnap && !isAutoResetting && (
        <div
          key={lastSnap.id}
          className={styles.snapNumber}
          style={{
            top: `${lastSnap.y}px`,
            transform: `translateX(-50%) rotate(${lastSnap.rotate}deg)`,
            animation: "none",
            opacity: 1,
            color: lastSnap.color,
          }}
        >
          +{lastSnap.count}
        </div>
      )}

      <div
        className={styles.buttonWrapper}
        onMouseLeave={onStopContinuousSnap}
        style={buttonWrapperStyle}
      >
        <button
          className={styles.snapButton}
          onTouchStart={onContinuousSnap}
          onTouchEnd={onStopContinuousSnap}
          onMouseDown={onContinuousSnap}
          onMouseUp={onStopContinuousSnap}
          onMouseLeave={onStopContinuousSnap}
          onClick={onSnap}
          title="Snap!"
          style={snapButtonStyle}
        >
          <img src="/snap-hand.svg" alt="Snap" style={snapButtonImgStyle} />
        </button>

        {showUndoButton && (
          <button
            className={styles.undoButton}
            onClick={onUndoSnap}
            title="Undo last snap"
            style={{
              ...undoButtonStyle,
              position: "absolute",
              top: "90px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9,
              padding: 0,
            }}
          >
            <img
              src="/undo-icon.svg"
              alt="Undo"
              style={{
                width: "27px",
                height: "27px",
                objectFit: "contain",
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
};
