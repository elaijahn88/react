import React, { useState, useEffect, useRef, useCallback } from 'react';

// 1. Define the type for a video item
interface VideoItem {
  id: string;
  url: string;
  title: string;
  // Add other properties as needed, e.g., 'username', 'likes', etc.
}

// 2. Mock API function to simulate fetching data
const fetchVideos = async (page: number): Promise<VideoItem[]> => {
  // Replace this with your actual API call using fetch or Axios
  console.log(`Fetching videos for page: ${page}`);
  const videosPerPage = 5;
  const start = (page - 1) * videosPerPage;
  const end = start + videosPerPage;
  
  // Dummy video data
  const dummyVideos: VideoItem[] = [
    { id: '1', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #1' },
    { id: '2', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #2' },
    { id: '3', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #3' },
    { id: '4', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #4' },
    { id: '5', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #5' },
    { id: '6', url: 'https://www.w3schools.com/html/mov_bbb.mp4', title: 'Big Buck Bunny #6' },
    // Add more videos here to simulate a large dataset
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate fetching a slice of the data
      resolve(dummyVideos.slice(start, end));
    }, 1000); // Simulate a network delay
  });
};

const VideoFeed: React.FC = () => {
  // 3. State management
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 4. useRef to reference the Intersection Observer and the last element
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoRef = useRef<HTMLDivElement | null>(null);

  // 5. useCallback to create the ref for the last element
  const lastVideoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return; // Prevent new fetches while one is in progress
    if (observer.current) observer.current.disconnect(); // Disconnect previous observer
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // When the last element is visible and there is more data, load the next page
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node); // Start observing the new last element
  }, [loading, hasMore]); // Re-create the observer if loading or hasMore changes

  // 6. useEffect to fetch data whenever the page number changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    const loadVideos = async () => {
      try {
        const newVideos = await fetchVideos(page);
        if (newVideos.length > 0) {
          setVideos(prevVideos => [...prevVideos, ...newVideos]);
          setHasMore(true);
        } else {
          // If no new videos are returned, there is no more data to load
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [page]); // This effect runs every time the 'page' state is updated

  // 7. Render the video feed
  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '10px' }}>
      <h1>Video Feed</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {videos.map((video, index) => {
          // Attach the ref to the last video in the list
          if (videos.length === index + 1) {
            return (
              <div key={video.id} ref={lastVideoElementRef} style={videoContainerStyle}>
                <video src={video.url} controls muted style={videoStyle} />
                <p>{video.title}</p>
              </div>
            );
          } else {
            return (
              <div key={video.id} style={videoContainerStyle}>
                <video src={video.url} controls muted style={videoStyle} />
                <p>{video.title}</p>
              </div>
            );
          }
        })}
      </div>

      {/* 8. Display loading, error, or end-of-content messages */}
      {loading && <p style={{ textAlign: 'center', margin: '20px 0' }}>Loading more videos...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!hasMore && !loading && <p style={{ textAlign: 'center', margin: '20px 0' }}>You've reached the end of the feed!</p>}
    </div>
  );
};

export default VideoFeed;

// 9. Basic styling
const videoContainerStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

