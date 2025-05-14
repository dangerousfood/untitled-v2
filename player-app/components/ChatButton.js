import { useRef } from 'react';
import styles from '../styles/VideoPlayer.module.css';

const ChatButton = ({ isVisible, onClick }) => {
  const chatButtonRef = useRef(null);
  
  return (
    <div 
      className={`${styles.chatButtonContainer} ${!isVisible ? styles.hidden : ''}`} 
      ref={chatButtonRef}
    >
      <button 
        className={styles.chatButton}
        onClick={onClick}
        title="Chat"
      >
        <img src="/bubble.svg" alt="Chat" />
      </button>
    </div>
  );
};

export default ChatButton; 