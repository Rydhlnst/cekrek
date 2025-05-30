"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RepeatIcon, CameraIcon, DownloadIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils";

const filterOptions = [
  { value: "none", label: "Normal", icon: "🟢" },
  { value: "grayscale", label: "Grayscale", icon: "⚫" },
  { value: "sepia", label: "Sepia", icon: "📜" },
  { value: "bright", label: "Bright", icon: "☀️" },
  { value: "contrast", label: "Contrast", icon: "🌓" },
  { value: "warm", label: "Warm", icon: "🔥" },
  { value: "cool", label: "Cool Tone", icon: "🧊" },
  { value: "blur", label: "Blur", icon: "🌫️" },
  { value: "invert", label: "Invert", icon: "🌈" },
  { value: "mono", label: "Monochrome", icon: "⚪" },
  { value: "vivid", label: "Vivid", icon: "🌟" },
];

// Defines the total dimensions of the output photo strip.
const stripSize: Record<4 | 8, { width: number; height: number }> = {
  4: { width: 180, height: 600 },
  8: { width: 370, height: 600 }, 
};

type EmojiStamp = { x: number; y: number; emoji: string };

type CanvasTemplate = {
  value: string;
  label: string;
  type: string;
  color: string | string[]; // Color for solid, or [start, end] for gradient
};

export const canvasTemplates: CanvasTemplate[] = [
  { value: "white", label: "White", type: "solid", color: "#ffffff" },
  { value: "lined", label: "Lined", type: "lined", color: "#ffffff" },
  { value: "dots", label: "Dotted", type: "dotted", color: "#ffffff" },
  { value: "black", label: "Black", type: "solid", color: "#000000" },
  { value: "blue", label: "Blue", type: "solid", color: "#cce5ff" },
  { value: "pink", label: "Pink", type: "solid", color: "#ffddee" },
  { value: "grid", label: "Grid", type: "grid", color: "#ffffff" },
  { value: "gradient1", label: "Sunset Gradient", type: "gradient", color: ["#ff9a9e", "#fad0c4"] },
  { value: "gradient2", label: "Ocean Gradient", type: "gradient", color: ["#a1c4fd", "#c2e9fb"] },
  { value: "gradient3", label: "Peach Gradient", type: "gradient", color: ["#fbc2eb", "#a6c1ee"] },
  { value: "bordered-blue", label: "Bordered Blue", type: "bordered", color: "#e6f2ff" },
  { value: "bordered-pink", label: "Bordered Pink", type: "bordered", color: "#ffe6f0" },
  { value: "bordered-green", label: "Bordered Green", type: "bordered", color: "#e6ffe6" },
  { value: "stars", label: "Star Dots", type: "pattern-stars", color: "#ffffff" },
  { value: "diagonal", label: "Diagonal Lines", type: "diagonal", color: "#ffffff" },
  { value: "light-gray", label: "Light Gray", type: "solid", color: "#f0f0f0" },
  { value: "canvas", label: "Canvas Texture", type: "canvas-texture", color: "#fdf6e3" },
  { value: "paper", label: "Paper Texture", type: "paper", color: "#fffaf0" },
  { value: "retro", label: "Retro Frame", type: "retro", color: "#f7e6a3" },
  { value: "dots-border", label: "Dot Border", type: "dot-border", color: "#ffffff" },
  // Example for image template (ensure path is correct in your public folder)
  // { value: "image_template_4", label: "Floral 4-Strip", type: "image", color: "/templates/strip-4-floral.png" },
  // { value: "image_template_8", label: "Party 8-Strip", type: "image", color: "/templates/strip-8-party.png" },
];

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Used for capturing from video
  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripCount, setStripCount] = useState<4 | 8>(4);
  const [stripPreview, setStripPreview] = useState<string | null>(null); // This will hold the DataURL of the generated strip
  const [customText, setCustomText] = useState("");
  const [previewStamps, setPreviewStamps] = useState<EmojiStamp[]>([]);
  // const [overlayStamps, setOverlayStamps] = useState<EmojiStamp[]>([]); // This state was unused, consider removing if not needed
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate>(canvasTemplates[0]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const getFilterClass = useCallback(() => {
    switch (selectedFilter) {
      case "grayscale": return "grayscale";
      case "sepia": return "sepia";
      case "bright": return "brightness-125";
      case "contrast": return "contrast-150";
      case "warm": return "hue-rotate-15 saturate-150"; // Example, adjust as needed
      case "cool": return "hue-rotate-180 saturate-150"; // Example, adjust as needed
      case "blur": return "blur-sm";
      case "invert": return "invert";
      case "mono": return "grayscale contrast-125"; // Example
      case "vivid": return "saturate-200 contrast-125"; // Example
      default: return "";
    }
  }, [selectedFilter]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      // TODO: Display a user-friendly error message in the UI
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Helper function to draw an image with rounded corners
  const drawRoundedImage = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number,
      radius = 12 // Default radius for rounded corners
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();
      // Simple draw, does not handle aspect ratio mismatches by cropping (like 'object-fit: cover')
      // For 'cover' behavior, sx, sy, sWidth, sHeight calculations would be needed here.
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
    },
    [] // No dependencies, this function is stable
  );

  const updateStripPreview = useCallback(
    async (imagesToDraw: string[], stampsToDraw = previewStamps) => {
      // 1. Get total dimensions for the strip from stripSize
      if (!stripSize || typeof stripSize[stripCount] === 'undefined') {
        console.error("stripSize or stripCount is invalid.", { stripSize, stripCount });
        setStripPreview(null);
        return;
      }
      const { width: stripTotalWidth, height: stripTotalHeight } = stripSize[stripCount];

      // 2. Create an in-memory canvas and get its 2D rendering context
      const canvas = document.createElement("canvas");
      canvas.width = stripTotalWidth;
      canvas.height = stripTotalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get canvas 2D context");
        setStripPreview(null);
        return;
      }

      // 3. Draw Background based on selectedTemplate
      // The 'width' and 'height' used in the switch cases now correctly refer to stripTotalWidth/Height
      switch (selectedTemplate.type) {
        case "solid":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          break;
        case "lined":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          ctx.strokeStyle = "#e0e0e0"; // Line color
          ctx.lineWidth = 1;
          for (let yPos = 20; yPos < stripTotalHeight; yPos += 20) { // Start lines with some padding
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(stripTotalWidth, yPos);
            ctx.stroke();
          }
          break;
        case "dots":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          ctx.fillStyle = "#cccccc"; // Dot color
          for (let yPos = 10; yPos < stripTotalHeight; yPos += 20) {
            for (let xPos = 10; xPos < stripTotalWidth; xPos += 20) {
              ctx.beginPath();
              ctx.arc(xPos, yPos, 1.5, 0, 2 * Math.PI); // Slightly larger dots
              ctx.fill();
            }
          }
          break;
        case "grid":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          ctx.strokeStyle = "#dddddd"; // Grid line color
          ctx.lineWidth = 1;
          for (let yPos = 0; yPos < stripTotalHeight; yPos += 20) {
            ctx.beginPath(); ctx.moveTo(0, yPos); ctx.lineTo(stripTotalWidth, yPos); ctx.stroke();
          }
          for (let xPos = 0; xPos < stripTotalWidth; xPos += 20) {
            ctx.beginPath(); ctx.moveTo(xPos, 0); ctx.lineTo(xPos, stripTotalHeight); ctx.stroke();
          }
          break;
        case "gradient":
          const [startColor, endColor] = selectedTemplate.color as [string, string];
          const gradient = ctx.createLinearGradient(0, 0, 0, stripTotalHeight);
          gradient.addColorStop(0, startColor);
          gradient.addColorStop(1, endColor);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          break;
        case "bordered":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          ctx.strokeStyle = "#999999"; // Border color
          ctx.lineWidth = 8; // Border width
          ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, stripTotalWidth - ctx.lineWidth, stripTotalHeight - ctx.lineWidth);
          break;
        case "pattern-stars":
          ctx.fillStyle = selectedTemplate.color as string;
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
          ctx.fillStyle = "#ffd700"; // Star color
          ctx.font = "20px Arial"; // Star size (using emoji)
          for (let yPos = 20; yPos < stripTotalHeight; yPos += 40) {
            for (let xPos = 20; xPos < stripTotalWidth; xPos += 40) {
              ctx.fillText("⭐", xPos, yPos);
            }
          }
          break;
        // Add other template types from your original code here, ensuring they use stripTotalWidth/Height
        case "diagonal":
             ctx.fillStyle = selectedTemplate.color as string;
             ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
             ctx.strokeStyle = "#d0d0d0";
             ctx.lineWidth = 1;
             for (let i = -stripTotalHeight; i < stripTotalWidth; i += 20) {
                 ctx.beginPath();
                 ctx.moveTo(i, 0);
                 ctx.lineTo(i + stripTotalHeight, stripTotalHeight);
                 ctx.stroke();
             }
             break;
        case "canvas-texture":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
            ctx.fillStyle = "rgba(0,0,0,0.05)"; // Subtle texture
            for (let y = 0; y < stripTotalHeight; y += 4) {
                for (let x = (y/4 % 2 === 0) ? 0 : 2; x < stripTotalWidth; x += 4) { // Offset for weave
                    ctx.fillRect(x, y, 2, 2);
                }
            }
            break;
        case "paper":
            ctx.fillStyle = selectedTemplate.color as string; // e.g., #fffaf0
            ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
            // Add subtle noise for paper texture
            for (let i = 0; i < 5000; i++) { // Adjust density of noise
                const x = Math.random() * stripTotalWidth;
                const y = Math.random() * stripTotalHeight;
                const alpha = Math.random() * 0.03; // Adjust opacity of noise
                ctx.fillStyle = `rgba(0,0,0,${alpha})`;
                ctx.fillRect(x, y, 1, 1);
            }
            break;
        case "retro":
            ctx.fillStyle = selectedTemplate.color as string; // e.g., #f7e6a3
            ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
            ctx.strokeStyle = "#c38b00"; // Darker border for retro
            ctx.lineWidth = 12; // Thicker border
            ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, stripTotalWidth - ctx.lineWidth, stripTotalHeight - ctx.lineWidth);
            // Inner shadow or highlight can also be added for more retro feel
            break;
        case "dot-border":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
            ctx.fillStyle = "#888888";
            const dotRadius = 2;
            const dotSpacing = 10;
            const borderWidth = dotRadius * 2 + 3; // padding for dots from edge
            // Top and bottom border dots
            for (let x = borderWidth; x < stripTotalWidth - borderWidth/2; x += dotSpacing) {
                ctx.beginPath(); ctx.arc(x, borderWidth, dotRadius, 0, 2 * Math.PI); ctx.fill(); // Top
                ctx.beginPath(); ctx.arc(x, stripTotalHeight - borderWidth, dotRadius, 0, 2 * Math.PI); ctx.fill(); // Bottom
            }
            // Left and right border dots (avoiding corners already covered)
            for (let y = borderWidth + dotSpacing; y < stripTotalHeight - borderWidth/2 - dotSpacing/2; y += dotSpacing) {
                ctx.beginPath(); ctx.arc(borderWidth, y, dotRadius, 0, 2 * Math.PI); ctx.fill(); // Left
                ctx.beginPath(); ctx.arc(stripTotalWidth - borderWidth, y, dotRadius, 0, 2 * Math.PI); ctx.fill(); // Right
            }
            break;
        case "image": // Assumes selectedTemplate.color is the image URL
          const bgTemplateImg = new window.Image();
          bgTemplateImg.crossOrigin = "Anonymous"; // If loading from different origin
          bgTemplateImg.src = selectedTemplate.color as string;
          try {
            await new Promise<void>((resolve) => {
              bgTemplateImg.onload = () => {
                ctx.drawImage(bgTemplateImg, 0, 0, stripTotalWidth, stripTotalHeight);
                resolve();
              };
              bgTemplateImg.onerror = (err) => {
                console.error("Failed to load background template image:", selectedTemplate.color, err);
                // Fallback to a solid color if image fails
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
                resolve(); // Resolve anyway to continue drawing other elements
              };
            });
          } catch (e) { 
            return e
          }
          break;
        default:
          ctx.fillStyle = "#ffffff"; // Default white background
          ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
      }

      // 4. Handle empty images: Draw placeholder text if no images are captured yet
      if (imagesToDraw.length === 0) {
        ctx.fillStyle = selectedTemplate.value === 'black' ? "#FFFFFF" : "#333333"; // Text color contrasting with background
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Arial";
        setStripPreview(canvas.toDataURL("image/png"));
        return;
      }

      // 5. Define layout parameters for frames
      const margin = 10; // Outer margin and gap between frames in 2-column layout
      const gap = 10;    // Vertical gap between frames in 1-column layout

      let cols = 1;
      // Determine number of columns based on stripCount
      if (stripCount === 8) {
        cols = 2;
      }

      // 6. Calculate individual frame dimensions
      let frameWidth: number, frameHeight: number;
      if (cols === 2) { // For 2-column layout (stripCount === 8)
        frameWidth = (stripTotalWidth - margin * (cols + 1)) / cols;
        frameHeight = frameWidth * 3 / 4; // Maintain 4:3 aspect ratio for frames
      } else { // For 1-column layout (stripCount === 4)
        frameWidth = stripTotalWidth - margin * 2; // Frame uses full width minus side margins
        frameHeight = frameWidth * 3 / 4;
      }

      // 7. Asynchronously load all captured images
      const imagePromises = imagesToDraw.slice(0, stripCount).map(src => { // Only load up to stripCount images
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "Anonymous"; // Important for tainted canvas if images are from other origins
          img.onload = () => resolve(img);
          img.onerror = (e) => {
            console.error("Failed to load image:", src, e);
            // Create a placeholder for failed images to avoid breaking the layout
            const placeholder = document.createElement('canvas');
            placeholder.width = frameWidth > 0 ? frameWidth : 100; // Use calculated frameWidth
            placeholder.height = frameHeight > 0 ? frameHeight : 75; // Use calculated frameHeight
            const pCtx = placeholder.getContext('2d');
            if (pCtx) {
              pCtx.fillStyle = '#dddddd';
              pCtx.fillRect(0,0,placeholder.width, placeholder.height);
              pCtx.fillStyle = '#aaaaaa';
              pCtx.textAlign = 'center';
              pCtx.textBaseline = 'middle';
              pCtx.font = `${Math.min(placeholder.width/6, 12)}px Arial`;
              pCtx.fillText('Load Error', placeholder.width/2, placeholder.height/2);
            }
            const errorImg = new window.Image();
            errorImg.src = placeholder.toDataURL();
            // Resolve with the error image so Promise.all doesn't reject entirely
            errorImg.onload = () => resolve(errorImg); 
            errorImg.onerror = () => reject(new Error(`Failed to create placeholder for ${src}`));
          };
          img.src = src;
        });
      });

      try {
        const loadedImages = await Promise.all(imagePromises);

        // 8. Draw each loaded image onto the canvas
        for (let i = 0; i < loadedImages.length; i++) {
          const imgToDraw = loadedImages[i];
          let x: number, y: number;

          if (cols === 2) { // 2-column layout (stripCount === 8)
            const colIndex = i % cols;
            const rowIndex = Math.floor(i / cols);
            if (rowIndex >= 4) continue; // Max 4 rows for 2x4 grid

            x = margin + colIndex * (frameWidth + margin);
            y = margin + rowIndex * (frameHeight + margin);
          } else { // 1-column layout (stripCount === 4)
             if (i >= 4) continue; // Max 4 images for single column

            x = margin;
            y = margin + i * (frameHeight + gap); // Use 'gap' for vertical spacing
          }
          drawRoundedImage(ctx, imgToDraw, x, y, frameWidth, frameHeight);
        }

        // 9. Draw Emoji Stamps (ensure coordinates are relative to the strip's total dimensions)
        stampsToDraw.forEach(({ x: stampX, y: stampY, emoji }) => {
          ctx.font = "24px serif"; // Consider making font size/family configurable
          ctx.textAlign = "center"; 
          ctx.textBaseline = "middle";
          // Ensure stamp coordinates are valid for the current strip size
          const finalStampX = Math.max(12, Math.min(stampX, stripTotalWidth - 12));
          const finalStampY = Math.max(12, Math.min(stampY, stripTotalHeight - 12));
          ctx.fillText(emoji, finalStampX, finalStampY);
        });

        // 10. Draw Custom Text at the bottom of the strip
        ctx.font = "bold 14px Arial"; 
        ctx.fillStyle = (selectedTemplate.value === 'black' || (Array.isArray(selectedTemplate.color) && selectedTemplate.color.includes('#000000'))) ? "#FFFFFF" : "#000000";
        ctx.textAlign = "center";
        ctx.fillText(customText, stripTotalWidth / 2, stripTotalHeight - 20); // Position 20px from bottom

      } catch (error) {
        console.error("Error processing images for canvas:", error);
        // Draw a global error message on the canvas if something went wrong during image loading/drawing
        ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
        ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Error generating preview.", stripTotalWidth / 2, stripTotalHeight / 2);
      }
      
      // 11. Set the generated strip image to state
      setStripPreview(canvas.toDataURL("image/png"));

    },
    [stripCount, customText, selectedTemplate, previewStamps, drawRoundedImage]
  );
  
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (capturedImages.length === 0) {
      if (stripPreview !== null) {
        setStripPreview(null);
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
      return; 
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      updateStripPreview(capturedImages, previewStamps);
    }, 250); // Waktu debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
    };
  }, [capturedImages, previewStamps, customText, selectedTemplate, stripCount, updateStripPreview]);


  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const tempCanvas = canvasRef.current; // This is the hidden canvas for video capture
    if (!video || !tempCanvas) return;

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
        if (!ctx) return;

        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (isMirrored) {
          ctx.translate(tempCanvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        const videoFilterStyle = getFilterClass();
        let canvasFilter = 'none';
        if (videoFilterStyle.includes('grayscale')) canvasFilter = 'grayscale(1)';
        if (videoFilterStyle.includes('sepia')) canvasFilter = 'sepia(1)';
        if (videoFilterStyle.includes('brightness-125')) canvasFilter = 'brightness(1.25)';
        if (videoFilterStyle.includes('contrast-150')) canvasFilter = 'contrast(1.5)';
        if (videoFilterStyle.includes('blur-sm')) canvasFilter = 'blur(2px)'; // Approx
        if (videoFilterStyle.includes('invert')) canvasFilter = 'invert(1)';
        // ... add more mappings if needed

        ctx.filter = canvasFilter; // Apply mapped filter
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.filter = 'none'; // Reset filter for next draw if any

        const dataUrl = tempCanvas.toDataURL("image/png");
        
        setCapturedImages((prevImages) => {
          const newImages = [...prevImages];
          if (retakeIndex !== null) {
            if (retakeIndex < newImages.length) {
                 newImages[retakeIndex] = dataUrl;
            } else { 
                newImages.push(dataUrl); 
            }
            setRetakeIndex(null); // Reset retake index
          } else if (newImages.length < stripCount) {
            newImages.push(dataUrl);
          }
          return newImages;
        });
      }
    }, 1000);
  }, [isMirrored, stripCount, retakeIndex, getFilterClass]); 

  const handleRetakeClick = (index: number) => {
    setRetakeIndex(index);
  };

  const handleReset = () => {
    setCapturedImages([]);
    setStripPreview(null);
    setPreviewStamps([]);
    setSelectedFilter("none");
    const defaultTemplate = canvasTemplates.find(t => t.value === "white") || canvasTemplates[0];
    setSelectedTemplate(defaultTemplate);
    setCustomText("SnapIt Booth © 2025");
    setRetakeIndex(null);
    if (videoRef.current) { 
        if (videoRef.current.paused) videoRef.current.play();
        if (!videoRef.current.srcObject || !(videoRef.current.srcObject as MediaStream).active) {
            startCamera();
        }
    }
  };

  const handleAddEmojiToPreviewCanvas = (emoji: string) => {
    if (capturedImages.length === 0) return; 

    const newStamp: EmojiStamp = {
        x: Math.random() * stripSize[stripCount].width * 0.8 + stripSize[stripCount].width * 0.1, 
        y: Math.random() * stripSize[stripCount].height * 0.8 + stripSize[stripCount].height * 0.1, 
        emoji: emoji,
    };
    
    setPreviewStamps((prevStamps) => {
        if (prevStamps.length < 10) { // Limit total number of stamps
             return [...prevStamps, newStamp];
        }
        return prevStamps;
    });
  };


  const handleDownload = () => {
    if (!stripPreview) return;
    const link = document.createElement("a");
    link.download = `photostrip-${Date.now()}.png`;
    link.href = stripPreview;
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full py-10 mt-10 px-4 md:px-0" suppressHydrationWarning>
      {/* VIDEO + PREVIEW AREA */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl items-start">
        {/* LEFT: VIDEO + CONTROLS */}
        <div className="flex flex-col gap-4 w-full lg:flex-1">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-800 shadow-lg">
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isMirrored ? "scale-x-[-1]" : "scale-x-100",
                getFilterClass()
              )}
              playsInline
              muted
              aria-label="Live camera feed"
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/30">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <span className="text-white text-5xl md:text-6xl font-bold leading-none">
                    {countdown}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <Button 
                onClick={handleCapture} 
                disabled={countdown !== null || (capturedImages.length >= stripCount && retakeIndex === null)}
                className="col-span-full sm:col-span-1 md:col-span-1"
                size="lg"
            >
              <CameraIcon className="w-5 h-5 mr-2" /> 
              {retakeIndex !== null ? `Retake Frame ${retakeIndex + 1}` : (capturedImages.length >= stripCount ? 'Strip Full' : 'Capture')}
            </Button>

            <Button onClick={() => setIsMirrored((prev) => !prev)} variant="outline">
              <RepeatIcon className="w-4 h-4 mr-2" /> {isMirrored ? "Unmirror" : "Mirror"}
            </Button>

            <Button variant="outline" onClick={handleReset}>
              Restart
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="truncate">
                  {filterOptions.find((f) => f.value === selectedFilter)?.icon}{" "}
                  {filterOptions.find((f) => f.value === selectedFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                {filterOptions.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg">{filter.icon}</span>
                    <span>{filter.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    {stripCount} Photo Strip
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {[4, 8].map((count) => (
                    <DropdownMenuItem
                        key={count}
                        onClick={() => {
                            setStripCount(count as 4 | 8);
                        }}
                    >
                        {count} Photo Strip
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="truncate">Template: {selectedTemplate.label}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                {canvasTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.value}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {template.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CUSTOMIZATION INPUTS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              type="text"
              placeholder="Custom text for strip..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="border px-3 py-2 rounded-md text-sm flex-grow bg-white dark:bg-neutral-700 dark:border-neutral-600"
              aria-label="Custom text for photo strip"
            />
             <div className="flex gap-2 items-center justify-center sm:justify-start">
                {["😂", "🔥", "❤️", "🌟", "�", "✨", "👍", "😎"].map((emoji) => (
                <Button
                    key={emoji}
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddEmojiToPreviewCanvas(emoji)}
                    className="text-xl hover:scale-110 transition-transform"
                    title={`Add ${emoji} stamp`}
                >
                    {emoji}
                </Button>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT: STRIP PREVIEW + RETAKE BUTTONS */}
        <div className={cn(
            "w-full mt-6 lg:mt-0 lg:w-auto lg:max-w-[400px] shrink-0 flex flex-col items-center",
            stripCount === 4 ? "lg:max-w-[180px]" : "lg:max-w-[370px]"
        )}>
          {stripPreview ? (
            <div className="relative shadow-xl rounded-lg border border-neutral-300 dark:border-neutral-700">
              <Image
                src={stripPreview}
                alt="Photo Strip Preview"
                width={stripSize[stripCount].width}
                height={stripSize[stripCount].height}
                className="rounded-lg"
                priority={true} 
              />
              {/* Overlay for Retake Buttons */}
              <div className="absolute inset-0 grid gap-1">
                {capturedImages.slice(0, stripCount).map((_, idx) => {
                  const margin = 10; const gap = 10;
                  let frameW, frameH, top, left;
                  const totalStripWidth = stripSize[stripCount].width;

                  if (stripCount === 8) { // 2 columns
                    const cols = 2;
                    frameW = (totalStripWidth - margin * (cols + 1)) / cols;
                    frameH = frameW * 3 / 4;
                    const col = idx % cols;
                    const row = Math.floor(idx / cols);
                    if (row >= 4) return null; // Max 4 rows

                    left = margin + col * (frameW + margin);
                    top = margin + row * (frameH + margin);
                  } else { // 1 column
                    if (idx >= 4) return null; // Max 4 images
                    frameW = totalStripWidth - margin * 2;
                    frameH = frameW * 3 / 4;
                    left = margin;
                    top = margin + idx * (frameH + gap);
                  }

                  const isCurrentlyRetaking = retakeIndex === idx;
                  return (
                    <div
                      key={`retake-btn-${idx}`}
                      className="absolute group"
                      style={{ top, left, width: frameW, height: frameH }}
                    >
                      <button
                        onClick={() => handleRetakeClick(idx)}
                        className={cn(
                          "w-full h-full flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                          isCurrentlyRetaking
                            ? "bg-blue-500/30 ring-2 ring-blue-600"
                            : "bg-black/0 hover:bg-black/30"
                        )}
                        title={`Retake frame ${idx + 1}`}
                        aria-label={`Retake frame ${idx + 1}`}
                      >
                        <CameraIcon className={cn(
                            "w-6 h-6 text-white opacity-0 group-hover:opacity-80 transition-opacity",
                            isCurrentlyRetaking && "opacity-80"
                        )} />
                         {isCurrentlyRetaking && (
                            <div className="absolute bottom-1 right-1 text-[10px] text-white font-semibold bg-blue-600 px-1.5 py-0.5 rounded-sm shadow">
                                Retaking
                            </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div 
                className="bg-neutral-200 dark:bg-neutral-700 rounded-lg shadow-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-center p-4"
                style={{ width: stripSize[stripCount].width, height: stripSize[stripCount].height }}
            >
                Your photo strip preview will appear here.
            </div>
          )}

          {capturedImages.length >= stripCount && stripPreview && (
            <div className="mt-4 flex justify-center w-full">
              <Button onClick={handleDownload} variant="default" size="lg" className="w-full max-w-xs">
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Strip
              </Button>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
    </div>
  );
}
