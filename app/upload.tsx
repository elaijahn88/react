import React, { useState, ChangeEvent, MouseEvent } from 'react';

// Define the types for the component's state
type UploadStatus = 'idle' | 'uploading' | 'successful' | 'failed';

const VideoUploader: React.FC = () => {
  // Specify that selectedFile can be a File object or null
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string>('');

  // The event handler is typed as a React.ChangeEvent for an HTMLInputElement
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Access the files property from the event target
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setMessage('');
    setUploadStatus('idle');
  };

  // The event handler is typed as a React.MouseEvent for an HTMLButtonElement
  const handleUpload = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!selectedFile) {
      setMessage('Please select a video file first!');
      return;
    }

    setUploadStatus('uploading');
    setMessage('');

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('video', selectedFile, selectedFile.name);

    const uploadUrl = 'YOUR_UPLOAD_ENDPOINT_URL'; // Replace with your server's endpoint

    try {
      // Use the fetch API to send the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('successful');
        setMessage(`Upload successful! Server response: ${JSON.stringify(result)}`);
        // Reset state after a successful upload
        setSelectedFile(null);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Video upload failed.');
      }
    } catch (error) {
      setUploadStatus('failed');
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unexpected error occurred.');
      }
      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <h3>Upload a Video</h3>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleFileChange} 
      />
      
      {selectedFile && (
        <p>Selected file: <strong>{selectedFile.name}</strong></p>
      )}

      <button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'uploading'}>
        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Video'}
      </button>

      {uploadStatus !== 'idle' && <p>Status: {uploadStatus}</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default VideoUploader;
