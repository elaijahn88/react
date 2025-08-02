import React from 'react';
import ReactPlayer from 'react-player';

function App() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🎥 React Video Player Example</h2>

      <ReactPlayer
        url="https://www.w3schools.com/html/mov_bbb.mp4"
        controls={true}
        width="100%"
        height="450px"
      />
    </div>
  );
}

export default App;
