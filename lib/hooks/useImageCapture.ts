// File: hooks/useImageCapture.ts

import { getCanvasFilterFromSelection } from '@/components/filterUtils';
import { useState, useCallback, RefObject } from 'react';
// import { getCanvasFilterFromSelection } from '../utils/filterUtils'; // Pastikan path ini benar

interface UseImageCaptureProps {
  videoRef: RefObject<HTMLVideoElement | null>; // <--- PERUBAHAN DI SINI
  captureCanvasRef: RefObject<HTMLCanvasElement | null>; // <--- DAN DI SINI
  isMirrored: boolean;
  selectedFilterValue: string;
  stripCount: 4 | 8; // Pastikan tipe ini sudah diimpor atau didefinisikan
  onCapture: (dataUrl: string, retakeIndex: number | null) => void;
}

export function useImageCapture({
  videoRef,
  captureCanvasRef,
  isMirrored,
  selectedFilterValue,
  // stripCount, // Tidak digunakan langsung di sini, jadi bisa dipertimbangkan untuk dihapus jika tidak perlu untuk konteks lain
  onCapture,
}: UseImageCaptureProps) {
  const [countdown, setCountdown] = useState<number | null>(null);

  const captureImage = useCallback((retakeIndex: number | null = null) => {
    // Pemeriksaan null untuk .current sudah ada dan itu bagus:
    const video = videoRef.current;
    const tempCanvas = captureCanvasRef.current;

    // Pastikan video sudah siap dan memiliki metadata sebelum mencoba mengakses videoWidth/videoHeight
    if (!video || !tempCanvas || video.readyState < video.HAVE_METADATA) {
        console.warn("Video or canvas not ready for capture or video metadata not loaded.");
        return;
    }

    let currentCountdownVal = 3;
    setCountdown(currentCountdownVal);

    const countdownInterval = setInterval(() => {
      currentCountdownVal--;
      if (currentCountdownVal > 0) {
        setCountdown(currentCountdownVal);
      } else {
        clearInterval(countdownInterval);
        setCountdown(null);

        const ctx = tempCanvas.getContext("2d");
        if (!ctx) {
            console.error("Failed to get 2D context from capture canvas");
            return;
        }

        // Dimensi video mungkin 0 jika video belum sepenuhnya dimuat
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("Video dimensions are zero, cannot capture.");
            return;
        }

        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        if (isMirrored) {
          ctx.translate(tempCanvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        // Pastikan getCanvasFilterFromSelection diimpor dan berfungsi
        // Untuk sementara, saya akan mengasumsikan fungsi ini ada dan mengembalikan string
        const canvasFilter = (typeof getCanvasFilterFromSelection === 'function')
                             ? getCanvasFilterFromSelection(selectedFilterValue)
                             : 'none'; // Fallback jika fungsi tidak ditemukan
        ctx.filter = canvasFilter;
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.filter = 'none'; // Reset filter

        const dataUrl = tempCanvas.toDataURL("image/png");
        onCapture(dataUrl, retakeIndex);
      }
    }, 1000);
  }, [videoRef, captureCanvasRef, isMirrored, selectedFilterValue, onCapture]);

  return { countdown, captureImage, isCapturing: countdown !== null };
}

// Dummy implementation for getCanvasFilterFromSelection if not provided elsewhere for this snippet
// Anda harus memiliki implementasi yang benar di utils/filterUtils.ts
// const getCanvasFilterFromSelection = (filterValue: string) => {
//   // Implementasi logika filter Anda
//   if (filterValue === "grayscale") return "grayscale(1)";
//   return "none";
// };