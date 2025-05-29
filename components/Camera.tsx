"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RepeatIcon, CameraIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const filterOptions = [
  { value: "none", label: "Normal", icon: "🟢" },
  { value: "grayscale", label: "Grayscale", icon: "⚫" },
  { value: "sepia", label: "Sepia", icon: "📜" },
  { value: "bright", label: "Bright", icon: "☀️" },
  { value: "contrast", label: "Contrast", icon: "🌓" },
  { value: "warm", label: "Warm", icon: "🔥" },
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
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isMirrored, setIsMirrored] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripCount, setStripCount] = useState<4 | 8>(4);
  const [stripPreview, setStripPreview] = useState<string | null>(null);
  const [customText, setCustomText] = useState("SnapIt Booth © 2025");
  const [previewStamps, setPreviewStamps] = useState<EmojiStamp[]>([]);
  const [overlayStamps, setOverlayStamps] = useState<EmojiStamp[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate>(canvasTemplates[0]);


  const getFilterClass = useCallback(() => {
    switch (selectedFilter) {
      case "grayscale": return "grayscale";
      case "sepia": return "sepia";
      case "bright": return "brightness-125";
      case "contrast": return "contrast-150";
      case "warm": return "hue-rotate-15 saturate-150";
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

        // Background template
        if (selectedTemplate.type === "solid") {
        ctx.fillStyle = selectedTemplate.color as string;
        ctx.fillRect(0, 0, width, height);

        } else if (selectedTemplate.type === "lined") {
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

        } else if (selectedTemplate.type === "dots") {
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

        } else if (selectedTemplate.type === "grid") {
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

        } else if (selectedTemplate.type === "gradient") {
        const [start, end] = selectedTemplate.color as [string, string];
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, start);
        gradient.addColorStop(1, end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        } else if (selectedTemplate.type === "bordered") {
        ctx.fillStyle = selectedTemplate.color as string;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 8;
        ctx.strokeRect(0, 0, width, height);

        } else if (selectedTemplate.type === "pattern-stars") {
        ctx.fillStyle = selectedTemplate.color as string;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ffd700";
        for (let y = 10; y < height; y += 40) {
            for (let x = 10; x < width; x += 40) {
            ctx.fillText("⭐", x, y);
            }
        }

        } else if (selectedTemplate.type === "diagonal") {
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

        } else if (selectedTemplate.type === "canvas-texture") {
        ctx.fillStyle = selectedTemplate.color as string;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#e0dbcd";
        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
            ctx.fillRect(x, y, 1, 1);
            }
        }

        } else if (selectedTemplate.type === "paper") {
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

        } else if (selectedTemplate.type === "retro") {
        ctx.fillStyle = selectedTemplate.color as string;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#c38b00";
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, width - 16, height - 16);

        } else if (selectedTemplate.type === "dot-border") {
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

        } else if (selectedTemplate.type === "image") {
        const bgTemplate = new window.Image();
        bgTemplate.src = `/templates/strip-${stripCount}.png`;
        await new Promise<void>((res) => {
            bgTemplate.onload = () => {
            ctx.drawImage(bgTemplate, 0, 0, width, height);
            res();
            };
            bgTemplate.onerror = () => res();
        });
        }


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

        stamps.forEach(({ x, y, emoji }) => {
        ctx.font = "24px serif";
        ctx.fillText(emoji, x, y);
        });

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
    if (!video || !canvas || capturedImages.length >= stripCount) return;
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
    const newImages = [...capturedImages, dataUrl];
    setCapturedImages(newImages);
    updateStripPreview(newImages);
  }, [capturedImages, isMirrored, stripCount, customText, previewStamps, updateStripPreview]);

  const handleDropEmoji = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData("emoji");
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOverlayStamps((prev) => [...prev, { x, y, emoji }]);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full py-10" suppressHydrationWarning>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        <div className="relative w-full lg:flex-1 max-w-4xl aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isMirrored ? "scale-x-[-1]" : "scale-x-100"
            } ${getFilterClass()}`}
            playsInline
            muted
          />
        </div>

        <div className="w-[180px] shrink-0 self-start">
          {stripPreview && (
            <Image
              src={stripPreview}
              alt="Live Strip Preview"
              width={stripSize[stripCount].width}
              height={stripSize[stripCount].height}
              className="rounded-xl border shadow"
            />
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="flex flex-row items-center space-x-3">
        <Button onClick={() => setIsMirrored((prev) => !prev)} variant="outline">
          <RepeatIcon className="w-4 h-4 mr-2" /> {isMirrored ? "Unmirror" : "Mirror"} View
        </Button>
        <input
            type="text"
            placeholder="Tulis teks custom..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="border px-3 py-2 rounded-md w-[300px] text-center"
        />
        <div className="flex gap-2">
            {["😂", "🔥", "❤️", "🌟", "🎉"].map((emoji, idx) => (
            <Button
                variant={"outline"}
                key={idx}
                onClick={() => handleAddEmojiToPreviewCanvas(emoji)}
                className="text-2xl cursor-pointer hover:scale-125 transition"
            >
                {emoji}
            </Button>
            ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleCapture} disabled={capturedImages.length >= stripCount}>
          <CameraIcon className="w-4 h-4 mr-2" /> Capture
        </Button>

        <Button variant={"destructive"} onClick={handleReset}>
            Reset
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
                className="flex items-center gap-2 cursor-pointer"
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

      </div>
    </div>
  );
}
