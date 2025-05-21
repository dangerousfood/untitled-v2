import styles from "../styles/Home.module.css";

export default function HomeLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Loading streams...</p>
    </div>
  );
}
