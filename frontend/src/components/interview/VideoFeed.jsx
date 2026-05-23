import React from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';
import { Camera, CameraOff } from 'lucide-react';
import useWebcam from '../../hooks/useWebcam';

function VideoFeed({ className = '' }) {
  const {
    webcamRef,
    isActive,
    error,
    handleUserMedia,
    handleUserMediaError,
    videoConstraints,
  } = useWebcam();

  return (
    <div className={`relative rounded-2xl overflow-hidden glass aspect-video ${className}`}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
          <CameraOff className="w-10 h-10 text-red-400 mb-2" />
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 glass rounded-full">
        <Camera className={`w-3 h-3 ${isActive ? 'text-accent' : 'text-red-400'}`} />
        <span className="text-xs font-medium">{isActive ? 'Live' : 'Offline'}</span>
      </div>
    </div>
  );
}

VideoFeed.propTypes = {
  className: PropTypes.string,
};

export default VideoFeed;
