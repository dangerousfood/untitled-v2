import Head from 'next/head';
import { useState, useEffect } from 'react';
import StreamFeed from '../components/StreamFeed';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [streams, setStreams] = useState(['stream1', 'stream1', 'stream1']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This would ideally fetch available streams from your backend
  useEffect(() => {
    // Simulating API call to fetch available streams
    const fetchStreams = async () => {
      try {
        // In a real application, you would fetch available streams from your server
        // For example: const response = await fetch('/api/streams');
        // const data = await response.json();
        
        // Using the same stream in all three slots
        setTimeout(() => {
          // Using the same stream key for all slots
          const singleStream = 'stream1';
          const duplicatedStreams = [singleStream, singleStream, singleStream];
          setStreams(duplicatedStreams);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching streams:', error);
        setError('Failed to load streams. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  return (
    <>
      <Head>
        <title>Stream Feed</title>
        <meta name="description" content="TikTok-style Stream Feed" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading streams...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <StreamFeed streams={streams} />
      )}
    </>
  );
} 