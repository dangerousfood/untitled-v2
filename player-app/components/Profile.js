import React from 'react';
import styles from '../styles/VideoPlayer.module.css';

const Profile = ({ username, profilePic, isFollowing, onToggleFollow }) => {
  return (
    <div className={styles.profilePopup}>
      <div className={styles.profilePicture}>
        <img src={profilePic} alt="Profile" />
      </div>
      <div className={styles.profileInfo}>
        <h3 className={styles.username}>{username}</h3>
        <button 
          className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
          onClick={onToggleFollow}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default Profile; 