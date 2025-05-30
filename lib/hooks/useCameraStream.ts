import {  useCallback, useEffect, RefObject } from 'react';

export function useCameraStream(videoRef: RefObject<HTMLVideoElement | null>) {
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, // Request HD for better quality captures
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { // Ensure video is playing before returning
            videoRef.current?.play().catch(e => console.error("Video play error:", e));
        }
      }
    } catch (err) {
      console.error("Camera error:", err);
      // TODO: Propagate error to UI
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return { startCamera, stopCamera };
}