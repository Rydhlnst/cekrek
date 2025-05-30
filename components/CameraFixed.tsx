"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI
import { RepeatIcon, CameraIcon, DownloadIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming Shadcn UI
import { canvasTemplates, DEFAULT_CUSTOM_TEXT, filterOptions, FRAME_BORDER_RADIUS, stripSizeConfig } from "./photoBooth.config";
import { calculateFrameLayout } from "./canvasUtils";
import { CanvasTemplate, EmojiStamp } from "./photoBooth.types";
import { getFilterClassForVideo } from "./filterUtils";
import { usePhotoStrip } from "@/lib/hooks/usePhotoStrip";
import { useImageCapture } from "@/lib/hooks/useImageCapture";
import { useCameraStream } from "@/lib/hooks/useCameraStream";

// Import all configurations, types, hooks, and utils
// (These would be actual import statements in separate files)
// import type { EmojiStamp, CanvasTemplate, StripLayout } from './photoBooth.types';
// import { filterOptions, stripSizeConfig, canvasTemplates, DEFAULT_CUSTOM_TEXT } from './photoBooth.config';
// import { getFilterClassForVideo } from './utils/filterUtils';
// import { calculateFrameLayout } from './utils/canvasUtils';
// import { useCameraStream } from './hooks/useCameraStream';
// import { useImageCapture } from './hooks/useImageCapture';
// import { usePhotoStrip } from './hooks/usePhotoStrip';

export function CameraFixed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null); // For capturing from video

  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedFilterValue, setSelectedFilterValue] = useState("none");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripCount, setStripCount] = useState<4 | 8>(4);
  const [customText, setCustomText] = useState(DEFAULT_CUSTOM_TEXT);
  const [previewStamps, setPreviewStamps] = useState<EmojiStamp[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate>(canvasTemplates[0]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Custom Hooks
  useCameraStream( videoRef ); // Handles camera start/stop

  const handleImageCaptured = useCallback((dataUrl: string, completedRetakeIndex: number | null) => {
    setCapturedImages((prevImages) => {
      const newImages = [...prevImages];
      if (completedRetakeIndex !== null) {
        if (completedRetakeIndex < newImages.length) {
          newImages[completedRetakeIndex] = dataUrl;
        } else { // Should not happen if retakeIndex is valid, but as a fallback
          newImages.push(dataUrl);
        }
        setRetakeIndex(null); // Reset retake index after capture
      } else if (newImages.length < stripCount) {
        newImages.push(dataUrl);
      }
      return newImages;
    });
  }, [stripCount]);

  const { countdown, captureImage, isCapturing } = useImageCapture({
    videoRef,
    captureCanvasRef,
    isMirrored,
    selectedFilterValue,
    stripCount,
    onCapture: handleImageCaptured,
  });

  const stripPreview = usePhotoStrip({
    stripCount,
    images: capturedImages,
    stamps: previewStamps,
    customText,
    template: selectedTemplate,
  });
  
  const videoFilterClass = getFilterClassForVideo(selectedFilterValue);

  const handleCaptureClick = () => {
    captureImage(retakeIndex); // Pass current retakeIndex to capture function
  };

  const handleRetakeClick = (index: number) => {
    setRetakeIndex(index); // Set retake mode for this index
    // Optionally, immediately trigger capture if desired, or let user click main capture button
    // captureImage(index); 
  };
  
  const handleReset = () => {
    setCapturedImages([]);
    setPreviewStamps([]);
    setSelectedFilterValue("none");
    const defaultTemplate = canvasTemplates.find(t => t.value === "white") || canvasTemplates[0];
    setSelectedTemplate(defaultTemplate);
    setCustomText(DEFAULT_CUSTOM_TEXT);
    setRetakeIndex(null);
    setStripCount(4); // Reset to default strip count
    // Camera stream is managed by useCameraStream, no need to manually restart here
    // unless specific re-initialization logic is needed.
  };

  const handleAddEmojiToPreviewCanvas = (emoji: string) => {
    if (capturedImages.length === 0 && !stripPreview) return; // Allow adding stamps to empty placeholder too

    const currentStripSize = stripSizeConfig[stripCount];
    const newStamp: EmojiStamp = {
      x: Math.random() * currentStripSize.width * 0.8 + currentStripSize.width * 0.1,
      y: Math.random() * currentStripSize.height * 0.8 + currentStripSize.height * 0.1,
      emoji: emoji,
    };
    setPreviewStamps((prevStamps) => prevStamps.length < 10 ? [...prevStamps, newStamp] : prevStamps);
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

  const isStripFull = capturedImages.length >= stripCount;
  const canCapture = !isCapturing && (!isStripFull || retakeIndex !== null);

  return (
    <div className="flex flex-col items-center gap-6 w-full py-10 mt-10 px-4 md:px-0" suppressHydrationWarning>
      {/* VIDEO + PREVIEW AREA */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl items-start">
        {/* LEFT: VIDEO + CONTROLS */}
        <div className="flex flex-col gap-4 w-full lg:flex-1">
          <div className="relative aspect-[4/3] lg:aspect-video rounded-xl overflow-hidden bg-neutral-800 shadow-lg"> {/* Typically 16/9 or 4/3 */}
            <video
              ref={videoRef}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isMirrored ? "scale-x-[-1]" : "", // scale-x-100 is default
                videoFilterClass
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"> {/* Simplified grid for smaller screens */}
            <Button 
                onClick={handleCaptureClick} 
                disabled={!canCapture}
                className="col-span-full sm:col-span-1" /* Takes full width on smallest, 1/3 on sm+ */
                size="lg"
            >
              <CameraIcon className="w-5 h-5 mr-2" /> 
              {retakeIndex !== null ? `Retake Frame ${retakeIndex + 1}` : (isStripFull ? 'Strip Full' : 'Capture')}
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
                  {filterOptions.find((f) => f.value === selectedFilterValue)?.icon}{" "}
                  {filterOptions.find((f) => f.value === selectedFilterValue)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                {filterOptions.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setSelectedFilterValue(filter.value)}
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
                            if (capturedImages.length > count && count < stripCount) { // If reducing strip size and have more images than new size
                                setCapturedImages(prev => prev.slice(0, count)); // Trim images
                            }
                            setStripCount(count as 4 | 8);
                            if (retakeIndex !== null && retakeIndex >= count) setRetakeIndex(null); // Reset retake if out of bounds
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
                {canvasTemplates.map((templateItem) => (
                  <DropdownMenuItem
                    key={templateItem.value}
                    onClick={() => setSelectedTemplate(templateItem)}
                  >
                    {templateItem.label}
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
               {["😂", "🔥", "❤️", "🌟", "🎉", "✨", "👍", "😎"].map((emoji) => ( // Changed one emoji for variety
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
            "w-full mt-6 lg:mt-0 lg:w-auto shrink-0 flex flex-col items-center",
            stripCount === 4 ? "lg:max-w-[180px]" : "lg:max-w-[370px]" // Use values from stripSizeConfig
        )}>
          {stripPreview ? (
            <div className="relative shadow-xl rounded-lg border border-neutral-300 dark:border-neutral-700">
              <Image
                src={stripPreview}
                alt="Photo Strip Preview"
                width={stripSizeConfig[stripCount].width}
                height={stripSizeConfig[stripCount].height}
                className="rounded-lg" // Keep rounded for the image itself
                priority={true} 
              />
              {/* Overlay for Retake Buttons */}
              <div className="absolute inset-0 grid"> {/* No gap needed here, positions are absolute */}
                {capturedImages.slice(0, stripCount).map((_, idx) => {
                  const frameLayout = calculateFrameLayout(
                    stripSizeConfig[stripCount].width,
                    stripSizeConfig[stripCount].height,
                    stripCount,
                    idx
                  );
                  if (!frameLayout) return null; // Should not happen with valid inputs
                  
                  const isCurrentlyRetaking = retakeIndex === idx;
                  return (
                    <div
                      key={`retake-btn-${idx}`}
                      className="absolute group"
                      style={{ top: frameLayout.y, left: frameLayout.x, width: frameLayout.width, height: frameLayout.height }}
                    >
                      <button
                        onClick={() => handleRetakeClick(idx)}
                        className={cn(
                          "w-full h-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                           `rounded-[${FRAME_BORDER_RADIUS}px]`, // Apply same rounding as canvas drawing
                          isCurrentlyRetaking
                            ? "bg-blue-500/50 ring-2 ring-blue-600" // More visible when active
                            : "bg-black/0 hover:bg-black/40"
                        )}
                        title={`Retake frame ${idx + 1}`}
                        aria-label={`Retake frame ${idx + 1}`}
                      >
                        <CameraIcon className={cn(
                            "w-6 h-6 text-white opacity-0 group-hover:opacity-90 transition-opacity",
                            isCurrentlyRetaking && "opacity-90"
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
              style={{ width: stripSizeConfig[stripCount].width, height: stripSizeConfig[stripCount].height }}
            >
              Your photo strip preview will appear here. <br/> Capture up to {stripCount} photos!
            </div>
          )}

          {isStripFull && stripPreview && retakeIndex === null && ( // Show download only when strip is full and not retaking
            <div className="mt-4 flex justify-center w-full">
              <Button onClick={handleDownload} variant="default" size="lg" className="w-full max-w-xs">
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download Strip
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Hidden canvas for image capture processing */}
      <canvas ref={captureCanvasRef} style={{ display: "none" }} aria-hidden="true" />
    </div>
  );
}