import { useEffect, useRef } from 'react';

export const TrackDetector = ({ videoRef, onAnalysisComplete }) => {
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;

    const analyzeTracks = () => {
      // Audio detection fallback strategy
      const hasAudio = 
        video.mozHasAudio || 
        video.webkitAudioDecodedByteCount > 0 || 
        (video.audioTracks && video.audioTracks.length > 0);

      // Video detection via physical dimensions
      const hasVideo = video.videoWidth > 0 && video.videoHeight > 0;

      onAnalysisComplete({
        isAudioOnly: hasAudio && !hasVideo,
        hasAudio,
        hasVideo
      });
    };

    // Attach listeners for data loading lifecycle
    video.addEventListener('loadedmetadata', analyzeTracks);
    video.addEventListener('loadeddata', analyzeTracks);

    return () => {
      video.removeEventListener('loadedmetadata', analyzeTracks);
      video.removeEventListener('loadeddata', analyzeTracks);
    };
  }, [videoRef, onAnalysisComplete]);

  return null; // This component handles logic only, rendering no UI
};
