import React from 'react';

import styles from '../styles/VideoPlayer.module.css';

const profileStyles = {
  container: {
    padding: '15px 20px',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 80%, transparent 100%)',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  picture: {
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid white',
    flexShrink: 0
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  info: {
    marginLeft: '15px',
    flexGrow: 1
  },
  username: {
    color: 'white',
    fontSize: '18px',
    margin: '0 0 12px 0',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
  },
  followButton: {
    backgroundColor: '#FF4081',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  followingButton: {
    backgroundColor: '#333'
  }
} as const;

interface ProfileProps {
  username?: string;
  profilePic?: string;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  username = 'User',
  profilePic = 'https://i.pravatar.cc/150',
  isFollowing = false,
  onToggleFollow = () => {}
}) => {
  console.log('Profile rendering:', { username, profilePic, isFollowing });
  
  return (
    <div className={styles.profilePopup} style={profileStyles.container}>
      <div className={styles.profilePicture} style={profileStyles.picture}>
        <img src={profilePic} alt="Profile" style={profileStyles.img} />
      </div>
      <div className={styles.profileInfo} style={profileStyles.info}>
        <h3 className={styles.username} style={profileStyles.username}>{username}</h3>
        <button 
          className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          onClick={onToggleFollow}
          style={{
            ...profileStyles.followButton,
            ...(isFollowing ? profileStyles.followingButton : {})
          }}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
};