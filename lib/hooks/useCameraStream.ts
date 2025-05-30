// File: hooks/useCameraStream.ts
import { useCallback, useEffect, RefObject, useState } from 'react';

interface CameraStreamOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  preferredLens?: 'user' | 'environment-default' | 'environment-ultrawide';
}

// File: hooks/useCameraStream.ts
// ... (import dan interface CameraStreamOptions) ...

export function useCameraStream({ videoRef, preferredLens = 'user' }: CameraStreamOptions) {
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  // Fungsi findUltraWideDevice tetap ada jika Anda masih ingin fitur itu,
  // jika tidak, Anda bisa menghapusnya dan menyederhanakan logika di bawah.
  const findUltraWideDevice = useCallback(async (): Promise<string | null> => {
    // ... (implementasi findUltraWideDevice dari jawaban sebelumnya) ...
    // (Ini hanya contoh, pastikan implementasi ini ada atau dihapus jika tidak dipakai)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const rearCameras = videoDevices.filter(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
      for (const device of rearCameras) {
        if (device.label.toLowerCase().includes('ultra wide') || device.label.toLowerCase().includes('ultrawide')) {
          return device.deviceId;
        }
      }
    } catch (error) { console.error('Error enumerating devices for ultra-wide:', error); }
    return null;
  }, []);


  const startCamera = useCallback(async () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
    }

    const videoConstraints: MediaTrackConstraints = {
      // --- KEMBALIKAN KE 16:9 SEBAGAI SUMBER ---
      aspectRatio: { ideal: 16 / 9 }, // Atau width/height spesifik
      width: { ideal: 1280 },      // Misalnya 1280px
      height: { ideal: 720 },     // Misalnya 720px
    };

    if (preferredLens === 'user') {
      videoConstraints.facingMode = 'user';
    } else if (preferredLens === 'environment-ultrawide') {
      const ultraWideDeviceId = await findUltraWideDevice();
      if (ultraWideDeviceId) {
        videoConstraints.deviceId = { exact: ultraWideDeviceId };
        videoConstraints.facingMode = 'environment';
      } else {
        videoConstraints.facingMode = 'environment'; // Fallback
      }
    } else { // environment-default
      videoConstraints.facingMode = 'environment';
    }

    try {
      console.log('Attempting to get media with constraints:', videoConstraints);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          }
        };
      }
      setActiveStream(stream);
    } catch (err) {
      console.error("Camera error:", err, "with constraints:", videoConstraints);
    }
  }, [videoRef, preferredLens, activeStream, findUltraWideDevice]);

  const stopCamera = useCallback(() => {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      setActiveStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef, activeStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
}