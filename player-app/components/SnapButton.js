import { useEffect, useRef, useState } from 'react';
import styles from '../styles/VideoPlayer.module.css';

const SnapButton = ({ 
  onSnap, 
  onContinuousSnap, 
  onStopContinuousSnap, 
  snapCount, 
  snapNumbers, 
  lastSnap, 
  isAutoResetting,
  onUndoSnap,
  showUndoButton,
  undoButtonStyle
}) => {
  const snapButtonRef = useRef(null);
  
  return (
    <div 
      className={styles.snapButtonContainer} 
      ref={snapButtonRef}
      onMouseLeave={onStopContinuousSnap}
    >
      {/* Regular animated snaps */}
      {snapNumbers.filter(snap => {
        // During auto-reset, show all snaps as animated
        if (isAutoResetting) {
          return true;
        }
        // During undo, only show snaps that aren't the lastSnap
        return !lastSnap || snap.id !== lastSnap.id;
      }).map(snap => (
        <div 
          key={snap.id}
          className={styles.snapNumber}
          style={{
            top: `${snap.y}px`,
            animationDuration: '2.5s',
            transform: `translateX(-50%) rotate(${snap.rotate}deg)`,
            color: snap.color
          }}
        >
          +{snap.count}
        </div>
      ))}
      
      {/* Last snap shown without animation - only if not in auto-reset */}
      {lastSnap && !isAutoResetting && (
        <div 
          key={lastSnap.id}
          className={styles.snapNumber}
          style={{
            top: `${lastSnap.y}px`,
            transform: `translateX(-50%) rotate(${lastSnap.rotate}deg)`,
            animation: 'none',
            opacity: 1,
            color: lastSnap.color
          }}
        >
          +{lastSnap.count}
        </div>
      )}
      
      <div 
        className={styles.buttonWrapper}
        onMouseLeave={onStopContinuousSnap}
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
        >
          <img src="/snap-hand.svg" alt="Snap" />
        </button>
        
        {showUndoButton && (
          <button 
            className={styles.undoButton} 
            onClick={onUndoSnap}
            title="Undo last snap"
            style={undoButtonStyle}
          >
            <img src="/undo-icon.svg" alt="Undo" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SnapButton; 