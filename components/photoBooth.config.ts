import { CanvasTemplate } from "./photoBooth.types";

export const filterOptions = [
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

export const stripSizeConfig: Record<4 | 8, { width: number; height: number }> = {
  4: { width: 180, height: 600 }, // typical photo booth strip aspect ratio (e.g., 2x6 inches at 90 DPI)
  8: { width: 370, height: 600 }, // Wider for 2x4 grid
};

export const canvasTemplates: CanvasTemplate[] = [
  { value: "white", label: "White", type: "solid", color: "#ffffff" },
  { value: "lined", label: "Lined", type: "lined", color: "#ffffff" },
  { value: "dots", label: "Dotted", type: "dotted", color: "#ffffff" },
  { value: "black", label: "Black", type: "solid", color: "#000000" },
  { value: "blue", label: "Blue", type: "solid", color: "#cce5ff" },
  { value: "pink", label: "Pink", type: "solid", color: "#ffddee" },
  { value: "grid", label: "Grid", type: "grid", color: "#ffffff" },
  { value: "gradient1", label: "Sunset", type: "gradient", color: ["#ff9a9e", "#fad0c4"] },
  { value: "gradient2", label: "Ocean", type: "gradient", color: ["#a1c4fd", "#c2e9fb"] },
  { value: "gradient3", label: "Peach", type: "gradient", color: ["#fbc2eb", "#a6c1ee"] },
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
  // { value: "image_template_4", label: "Floral 4-Strip", type: "image", color: "/templates/strip-4-floral.png", imageUrl4: "/templates/strip-4-floral.png", imageUrl8: "/templates/strip-8-party.png" },
];

export const DEFAULT_CUSTOM_TEXT = "";
export const FRAME_ASPECT_RATIO = 4 / 3; // e.g. 4:3 for each photo
export const FRAME_MARGIN = 10; // Outer margin and gap between frames
export const FRAME_GAP = 10; // Vertical gap between frames in 1-column layout
export const FRAME_BORDER_RADIUS = 12;