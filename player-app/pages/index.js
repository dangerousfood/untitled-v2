import Head from 'next/head';
import { useState, useEffect } from 'react';
import StreamFeed from '../components/StreamFeed';

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
        <div className="loadingContainer">
          <div className="loadingSpinner"></div>
          <p>Loading streams...</p>
        </div>
      ) : error ? (
        <div className="errorContainer">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <StreamFeed streams={streams} />
      )}

      <style jsx>{`
        .loadingContainer, .errorContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #000;
          color: white;
        }
        
        .loadingSpinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .errorContainer button {
          margin-top: 20px;
          padding: 8px 16px;
          background-color: #333;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .errorContainer button:hover {
          background-color: #444;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
} 