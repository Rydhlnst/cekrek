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


const stripSize: Record<4 | 8, { width: number; height: number }> = {
  4: { width: 180, height: 600 },
  8: { width: 180, height: 1200 },
};

type EmojiStamp = { x: number; y: number; emoji: string };

type CanvasTemplate = {
  value: string;
  label: string;
  type: string;
  color: string | string[];
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
];


export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripCount, setStripCount] = useState<4 | 8>(4);
  const [stripPreview, setStripPreview] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [previewStamps, setPreviewStamps] = useState<EmojiStamp[]>([]);
  const [overlayStamps, setOverlayStamps] = useState<EmojiStamp[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate>(canvasTemplates[0]);
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const getFilterClass = useCallback(() => {
    switch (selectedFilter) {
        case "grayscale":
        return "grayscale";
        case "sepia":
        return "sepia";
        case "bright":
        return "brightness-125";
        case "contrast":
        return "contrast-150";
        case "warm":
        return "hue-rotate-15 saturate-150";
        case "cool":
        return "hue-rotate-180 saturate-150";
        case "blur":
        return "blur-sm";
        case "invert":
        return "invert";
        case "mono":
        return "grayscale contrast-125";
        case "vivid":
        return "saturate-200 contrast-125";
        default:
        return "";
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

  const drawRoundedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 12
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
    ctx.drawImage(img, x, y, width, height);
    ctx.restore();
  };

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
    if (capturedImages.length === 0) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
        updateStripPreview(capturedImages, previewStamps);
    }, 200);
    }, [capturedImages, previewStamps, customText, selectedTemplate, stripCount]);


  const updateStripPreview = useCallback(
    async (images: string[], stamps = previewStamps) => {
        const { width, height } = stripSize[stripCount];
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const margin = 10;
        const gap = 10;
        const frameWidth = width - margin * 2;
        const frameHeight = frameWidth * 3 / 4;

        // Draw background
        switch (selectedTemplate.type) {
        case "solid":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            break;
        case "lined":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#e0e0e0";
            ctx.lineWidth = 1;
            for (let y = 0; y < height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            }
            break;
        case "dots":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#cccccc";
            for (let y = 0; y < height; y += 20) {
            for (let x = 0; x < width; x += 20) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, 2 * Math.PI);
                ctx.fill();
            }
            }
            break;
        case "grid":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#dddddd";
            ctx.lineWidth = 1;
            for (let y = 0; y < height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            }
            for (let x = 0; x < width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            }
            break;
        case "gradient":
            const [start, end] = selectedTemplate.color as [string, string];
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, start);
            gradient.addColorStop(1, end);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            break;
        case "bordered":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 8;
            ctx.strokeRect(0, 0, width, height);
            break;
        case "pattern-stars":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#ffd700";
            for (let y = 10; y < height; y += 40) {
            for (let x = 10; x < width; x += 40) {
                ctx.fillText("⭐", x, y);
            }
            }
            break;
        case "diagonal":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#d0d0d0";
            ctx.lineWidth = 1;
            for (let i = -height; i < width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
            }
            break;
        case "canvas-texture":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#e0dbcd";
            for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                ctx.fillRect(x, y, 1, 1);
            }
            }
            break;
        case "paper":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#f2eecb";
            ctx.lineWidth = 0.5;
            for (let y = 0; y < height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            }
            break;
        case "retro":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = "#c38b00";
            ctx.lineWidth = 6;
            ctx.strokeRect(8, 8, width - 16, height - 16);
            break;
        case "dot-border":
            ctx.fillStyle = selectedTemplate.color as string;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#888888";
            for (let x = 5; x < width; x += 10) {
            ctx.beginPath();
            ctx.arc(x, 5, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, height - 5, 2, 0, 2 * Math.PI);
            ctx.fill();
            }
            for (let y = 5; y < height; y += 10) {
            ctx.beginPath();
            ctx.arc(5, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width - 5, y, 2, 0, 2 * Math.PI);
            ctx.fill();
            }
            break;
        case "image":
            const bgTemplate = new window.Image();
            bgTemplate.src = `/templates/strip-${stripCount}.png`;
            await new Promise<void>((res) => {
            bgTemplate.onload = () => {
                ctx.drawImage(bgTemplate, 0, 0, width, height);
                res();
            };
            bgTemplate.onerror = () => res();
            });
            break;
        }

        // Draw each captured image
        for (let i = 0; i < images.length; i++) {
        const img = new window.Image();
        img.src = images[i];
        await new Promise<void>((res) => {
            img.onload = () => {
            const y = gap + i * (frameHeight + gap);
            drawRoundedImage(ctx, img, margin, y, frameWidth, frameHeight);
            res();
            };
            img.onerror = () => res();
        });
        }

        // Emoji Stamps
        stamps.forEach(({ x, y, emoji }) => {
        ctx.font = "24px serif";
        ctx.fillText(emoji, x, y);
        });

        // Text
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(customText, width / 2, height - 20);

        const dataUrl = canvas.toDataURL("image/png");
        setStripPreview(dataUrl);
    },
    [stripCount, previewStamps, customText, selectedTemplate]
    );


    const handleReset = () => {
        setCapturedImages([]);
        setStripPreview(null);
        setOverlayStamps([]);
        setPreviewStamps([]);
        setSelectedFilter("none");
        const defaultTemplate = canvasTemplates.find(t => t.value === "white");
        if (defaultTemplate) setSelectedTemplate(defaultTemplate);
        setCustomText("SnapIt Booth © 2025");
    };


    const handleAddEmojiToPreviewCanvas = (emoji: string) => {
        const { width } = stripSize[stripCount];
        const margin = 10;
        const gap = 10;
        const frameWidth = width - margin * 2;
        const frameHeight = frameWidth * 3 / 4;

        const emojisPerFrame = previewStamps.length / capturedImages.length;
        if (emojisPerFrame >= 2) return;

        const isSecondEmoji = emojisPerFrame === 1;

        const newStamps: EmojiStamp[] = capturedImages.map((_, idx) => {
            const isTop = !isSecondEmoji;
            const isEven = idx % 2 === 0;

            const x = isTop
            ? (isEven ? margin + frameWidth - 20 : margin + 2) // kanan/kiri atas
            : (isEven ? margin + 2 : margin + frameWidth - 20); // kiri/kanan bawah

            const y = gap + idx * (frameHeight + gap) + (isTop ? 20 : frameHeight - 24);

            return { x, y, emoji };
        });

        const updated = [...previewStamps, ...newStamps];
        setPreviewStamps(updated);
        updateStripPreview(capturedImages, updated);
        };


    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        let currentCountdown = 3;
        setCountdown(currentCountdown);

        const countdownInterval = setInterval(() => {
            currentCountdown--;
            if (currentCountdown > 0) {
            setCountdown(currentCountdown);
            } else {
            clearInterval(countdownInterval);
            setCountdown(null); // hilangkan angka countdown

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (isMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.filter = window.getComputedStyle(video).filter;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL("image/png");
            const newImages = [...capturedImages];

            if (retakeIndex !== null) {
                newImages[retakeIndex] = dataUrl;
                setRetakeIndex(null);
            } else if (newImages.length < stripCount) {
                newImages.push(dataUrl);
            }

            setCapturedImages(newImages);
            updateStripPreview(newImages);
            }
        }, 1000);
        }, [capturedImages, isMirrored, stripCount, retakeIndex, updateStripPreview]);

        const handleRetakeClick = (index: number) => {
            setRetakeIndex(index);
        };

        const handleDownload = () => {
            if (!stripPreview) return;

            const link = document.createElement("a");
            link.download = "photostrip.png";
            link.href = stripPreview;
            link.click();
        };


  return (
    <div className="flex flex-col items-center gap-6 w-full py-10 mt-10" suppressHydrationWarning>
        {/* VIDEO + PREVIEW */}
        <div className="flex flex-row gap-6 w-full max-w-6xl items-start">
            {/* LEFT: VIDEO + BUTTONS */}
            <div className="flex flex-col gap-4 w-full max-w-4xl">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-all duration-300 ${
                    isMirrored ? "scale-x-[-1]" : "scale-x-100"
                } ${getFilterClass()}`}
                playsInline
                muted
                />
                {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-[120px] h-[120px] rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-white text-6xl font-bold leading-none">
                            {countdown}
                        </span>
                        </div>
                    </div>
                    )}
                </div>
                
            {/* BUTTONS */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <Button onClick={handleCapture}>
                <CameraIcon className="w-4 h-4 mr-2" /> Capture
                </Button>

                <Button onClick={() => setIsMirrored((prev) => !prev)} variant="outline">
                <RepeatIcon className="w-4 h-4 mr-2" /> {isMirrored ? "Unmirror" : "Mirror"}
                </Button>

                <Button variant="outline" onClick={handleReset}>
                    <span>Restart</span>
                </Button>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    {filterOptions.find((f) => f.value === selectedFilter)?.icon}{" "}
                    {filterOptions.find((f) => f.value === selectedFilter)?.label}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    {filterOptions.map((filter) => (
                    <DropdownMenuItem
                        key={filter.value}
                        onClick={() => setSelectedFilter(filter.value)}
                        className="flex items-center gap-2"
                    >
                        <span className="text-xl">{filter.icon}</span>
                        <span className="capitalize">{filter.label}</span>
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Template: {selectedTemplate.label}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    {canvasTemplates.map((template) => (
                    <DropdownMenuItem
                        key={template.value}
                        onClick={() => setSelectedTemplate(template)}
                        className="capitalize"
                    >
                        {template.label}
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-2">
                {["😂", "🔥", "❤️", "🌟", "🎉"].map((emoji, idx) => (
                    <Button
                    key={idx}
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddEmojiToPreviewCanvas(emoji)}
                    className="text-2xl cursor-pointer hover:scale-125 transition"
                    >
                    {emoji}
                    </Button>
                ))}
                </div>
            </div>

            {/* INPUT + EMOJI */}
            <div className="flex flex-col gap-2">
                <input
                type="text"
                placeholder="Tulis teks custom..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="border px-3 py-2 rounded-md text-center"
                />
            </div>
            </div>

            {/* RIGHT: STRIP PREVIEW */}
            <div className="w-[180px] shrink-0">
            {stripPreview && (
                <div className="relative">
                    <Image
                    src={stripPreview}
                    alt="Live Strip Preview"
                    width={stripSize[stripCount].width}
                    height={stripSize[stripCount].height}
                    className="rounded-xl border shadow"
                    />
                    <div className="absolute inset-0">
                    {capturedImages.map((_, idx) => {
                        const { width } = stripSize[stripCount];
                        const margin = 10;
                        const gap = 10;
                        const frameWidth = width - margin * 2;
                        const frameHeight = (frameWidth * 3) / 4;
                        const top = gap + idx * (frameHeight + gap);

                        const isRetake = retakeIndex === idx;

                        return (
                            <div
                            key={idx}
                            className="absolute left-0 right-0 mx-auto w-full transition-all"
                            style={{
                                top,
                                height: frameHeight,
                            }}
                            >
                            <button
                                onClick={() => handleRetakeClick(idx)}
                                className={cn(
                                "group w-full h-full relative overflow-hidden rounded-xl transition-all duration-300",
                                isRetake
                                    ? "ring-4 ring-accent/70 ring-offset-2 ring-offset-background"
                                    : "hover:ring-2 hover:ring-white/20"
                                )}
                                title={`Retake frame ${idx + 1}`}
                            >
                                {/* Dark translucent overlay with camera icon */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <CameraIcon className="w-6 h-6 text-white/80 bg-black/50 p-1 rounded-full backdrop-blur-sm" />
                                </div>

                                {/* Text indicator for retaking */}
                                {isRetake && (
                                <div className="absolute bottom-2 right-2 text-xs text-foreground font-semibold bg-accent px-3 py-1 rounded-md shadow backdrop-blur-md">
                                    Retaking...
                                </div>
                                )}
                            </button>
                            </div>
                        );
                        })}
                    </div>
                </div>
                )}
                {capturedImages.length === stripCount && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={handleDownload} variant={"outline"} className="px-6 py-2 text-base">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Strip
                    </Button>
                </div>
                )}
            </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>



  );
}
