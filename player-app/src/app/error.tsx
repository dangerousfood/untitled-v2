"use client";

import styles from "../styles/Home.module.css";

export default function HomeError() {
  return (
    <div className={styles.errorContainer}>
      <p>An error occured, pelase rertry by refreshing the page</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}
