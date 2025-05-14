import styles from '../styles/VideoPlayer.module.css';

const MuteButton = ({ isMuted, isVisible, onToggleMute }) => {
  return (
    <button 
      className={`${styles.muteButton} ${isVisible ? styles.visible : styles.hidden}`}
      onClick={onToggleMute}
      aria-label={isMuted ? "Unmute" : "Mute"}
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M13 5v14l-5-5H3V10h5l5-5z"/>
          <path d="M16.59 15.59L18 17l-4-4-4 4 1.41 1.41L14 15.83z" stroke="currentColor" strokeWidth="1" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M13 5v14l-5-5H3V10h5l5-5z"/>
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      )}
    </button>
  );
};

export default MuteButton; 