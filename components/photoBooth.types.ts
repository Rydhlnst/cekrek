export type EmojiStamp = { x: number; y: number; emoji: string };

export type CanvasTemplate = {
  value: string;
  label: string;
  type: string;
  color: string | string[]; // Color for solid, or [start, end] for gradient
  // Optional: specific image URLs for 4-strip and 8-strip if they differ
  imageUrl4?: string;
  imageUrl8?: string;
};

export type StripLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};