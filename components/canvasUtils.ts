import { FRAME_ASPECT_RATIO, FRAME_BORDER_RADIUS, FRAME_GAP, FRAME_MARGIN } from "./photoBooth.config";
import { CanvasTemplate, StripLayout } from "./photoBooth.types";

export function calculateFrameLayout(
  stripTotalWidth: number,
  _stripTotalHeight: number, // Not directly used for frame calculation, but passed for consistency
  stripCount: 4 | 8,
  imageIndex: number
): StripLayout {
  let frameWidth: number, frameHeight: number, x: number, y: number;
  const cols = stripCount === 8 ? 2 : 1;

  if (cols === 2) { // 2-column layout (stripCount === 8)
    frameWidth = (stripTotalWidth - FRAME_MARGIN * (cols + 1)) / cols;
    frameHeight = frameWidth / FRAME_ASPECT_RATIO; // Use defined aspect ratio
    const colIndex = imageIndex % cols;
    const rowIndex = Math.floor(imageIndex / cols);
    x = FRAME_MARGIN + colIndex * (frameWidth + FRAME_MARGIN);
    y = FRAME_MARGIN + rowIndex * (frameHeight + FRAME_MARGIN);
  } else { // 1-column layout (stripCount === 4)
    frameWidth = stripTotalWidth - FRAME_MARGIN * 2;
    frameHeight = frameWidth / FRAME_ASPECT_RATIO;
    x = FRAME_MARGIN;
    y = FRAME_MARGIN + imageIndex * (frameHeight + FRAME_GAP);
  }
  return { x, y, width: frameWidth, height: frameHeight };
}

/**
 * Draws an image within a rounded rectangle, achieving an 'object-fit: cover' effect.
 */
export function drawRoundedImageWithCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number, // Target width of the rounded rect
  height: number, // Target height of the rounded rect
  radius = FRAME_BORDER_RADIUS
) {
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

  const targetAspectRatio = width / height;
  const imageAspectRatio = img.naturalWidth / img.naturalHeight;
  let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

  if (imageAspectRatio > targetAspectRatio) { // Image is wider than target, crop sides
    sWidth = img.naturalHeight * targetAspectRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else if (imageAspectRatio < targetAspectRatio) { // Image is taller than target, crop top/bottom
    sHeight = img.naturalWidth / targetAspectRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
  ctx.restore();
}

/**
 * Draws the background for the photo strip based on the selected template.
 */
export async function drawTemplateBackground(
  ctx: CanvasRenderingContext2D,
  template: CanvasTemplate,
  width: number,
  height: number,
  stripCount: 4 | 8 // Added to select specific image URL if provided
): Promise<void> {
  // Common clear before drawing new background
  ctx.clearRect(0, 0, width, height);

  switch (template.type) {
    case "solid":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      break;
    case "lined":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#e0e0e0"; ctx.lineWidth = 1;
      for (let yPos = 20; yPos < height; yPos += 20) {
        ctx.beginPath(); ctx.moveTo(0, yPos); ctx.lineTo(width, yPos); ctx.stroke();
      }
      break;
    case "dots":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#cccccc";
      for (let yPos = 10; yPos < height; yPos += 20) {
        for (let xPos = 10; xPos < width; xPos += 20) {
          ctx.beginPath(); ctx.arc(xPos, yPos, 1.5, 0, 2 * Math.PI); ctx.fill();
        }
      }
      break;
    case "grid":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#dddddd"; ctx.lineWidth = 1;
      for (let yPos = 0; yPos < height; yPos += 20) { ctx.beginPath(); ctx.moveTo(0, yPos); ctx.lineTo(width, yPos); ctx.stroke(); }
      for (let xPos = 0; xPos < width; xPos += 20) { ctx.beginPath(); ctx.moveTo(xPos, 0); ctx.lineTo(xPos, height); ctx.stroke(); }
      break;
    case "gradient":
      const [startColor, endColor] = template.color as [string, string];
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, startColor); gradient.addColorStop(1, endColor);
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      break;
    case "bordered":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#999999"; ctx.lineWidth = 8;
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);
      break;
    case "pattern-stars":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffd700"; ctx.font = "20px Arial";
      for (let yPos = 20; yPos < height; yPos += 40) {
        for (let xPos = 20; xPos < width; xPos += 40) { ctx.fillText("⭐", xPos, yPos); }
      }
      break;
    case "diagonal":
        ctx.fillStyle = template.color as string;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#d0d0d0"; ctx.lineWidth = 1;
        for (let i = -height; i < width; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + height, height); ctx.stroke();
        }
        break;
    case "canvas-texture":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for (let y = 0; y < height; y += 4) {
        for (let x = (y/4 % 2 === 0) ? 0 : 2; x < width; x += 4) { ctx.fillRect(x, y, 2, 2); }
      }
      break;
    case "paper":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 5000 * (width/180) * (height/600) ; i++) { // Scale noise with size
          const x = Math.random() * width; const y = Math.random() * height;
          const alpha = Math.random() * 0.03;
          ctx.fillStyle = `rgba(0,0,0,${alpha})`; ctx.fillRect(x, y, 1, 1);
      }
      break;
    case "retro":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#c38b00"; ctx.lineWidth = 12;
      ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, width - ctx.lineWidth, height - ctx.lineWidth);
      break;
    case "dot-border":
      ctx.fillStyle = template.color as string;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#888888";
      const dotRadius = 2; const dotSpacing = 10; const borderWidth = dotRadius * 2 + 3;
      for (let x = borderWidth; x < width - borderWidth/2; x += dotSpacing) {
          ctx.beginPath(); ctx.arc(x, borderWidth, dotRadius, 0, 2 * Math.PI); ctx.fill();
          ctx.beginPath(); ctx.arc(x, height - borderWidth, dotRadius, 0, 2 * Math.PI); ctx.fill();
      }
      for (let y = borderWidth + dotSpacing; y < height - borderWidth/2 - dotSpacing/2; y += dotSpacing) {
          ctx.beginPath(); ctx.arc(borderWidth, y, dotRadius, 0, 2 * Math.PI); ctx.fill();
          ctx.beginPath(); ctx.arc(width - borderWidth, y, dotRadius, 0, 2 * Math.PI); ctx.fill();
      }
      break;
    case "image":
      // Prefer specific URLs if available, fallback to generic color field
      const imageUrl = stripCount === 4 ? template.imageUrl4 : template.imageUrl8;
      const finalImageUrl = imageUrl || template.color as string;

      const bgTemplateImg = new window.Image();
      bgTemplateImg.crossOrigin = "Anonymous";
      bgTemplateImg.src = finalImageUrl;
      try {
        await new Promise<void>((resolve) => {
          bgTemplateImg.onload = () => { ctx.drawImage(bgTemplateImg, 0, 0, width, height); resolve(); };
          bgTemplateImg.onerror = (err) => {
            console.error("Failed to load background template image:", finalImageUrl, err);
            ctx.fillStyle = "#cccccc"; ctx.fillRect(0, 0, width, height); // Fallback
            resolve(); // Resolve to not break the chain
          };
        });
      } catch (e) { console.error("Image loading promise error", e); }
      break;
    default:
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
  }
}