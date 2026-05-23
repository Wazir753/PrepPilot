import { useRef, useState, useCallback, useEffect } from 'react';

export default function useWebcam({ width = 640, height = 480, facingMode = 'user' } = {}) {
  const webcamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((mediaDevices) => {
        const videoDevices = mediaDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
      })
      .catch(() => setDevices([]));
  }, []);

  const capture = useCallback(() => {
    if (!webcamRef.current) return null;
    const imageSrc = webcamRef.current.getScreenshot({ width, height });
    return imageSrc;
  }, [width, height]);

  const handleUserMedia = useCallback(() => {
    setIsActive(true);
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((err) => {
    setIsActive(false);
    setError(err?.message || 'Camera access denied');
  }, []);

  const videoConstraints = {
    width,
    height,
    facingMode,
  };

  return {
    webcamRef,
    isActive,
    error,
    devices,
    capture,
    handleUserMedia,
    handleUserMediaError,
    videoConstraints,
  };
}
