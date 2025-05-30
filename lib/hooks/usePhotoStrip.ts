import { calculateFrameLayout, drawRoundedImageWithCover, drawTemplateBackground } from '@/components/canvasUtils';
import { FRAME_ASPECT_RATIO, stripSizeConfig } from '@/components/photoBooth.config';
import { CanvasTemplate, EmojiStamp } from '@/components/photoBooth.types';
import { useState, useEffect, useCallback, useRef } from 'react';
// import type { CanvasTemplate, EmojiStamp } from '../photoBooth.types';
// import { stripSizeConfig } from '../photoBooth.config';
// import { drawTemplateBackground, drawRoundedImageWithCover, calculateFrameLayout } from '../utils/canvasUtils';

interface UsePhotoStripProps {
  stripCount: 4 | 8;
  images: string[];
  stamps: EmojiStamp[];
  customText: string;
  template: CanvasTemplate;
}

export function usePhotoStrip({
  stripCount,
  images,
  stamps,
  customText,
  template,
}: UsePhotoStripProps) {
  const [stripPreview, setStripPreview] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateStrip = useCallback(async () => {
    if (!stripSizeConfig || typeof stripSizeConfig[stripCount] === 'undefined') {
      console.error("stripSizeConfig or stripCount is invalid.", { stripSizeConfig, stripCount });
      setStripPreview(null);
      return;
    }
    const { width: stripTotalWidth, height: stripTotalHeight } = stripSizeConfig[stripCount];

    const canvas = document.createElement("canvas");
    canvas.width = stripTotalWidth;
    canvas.height = stripTotalHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get canvas 2D context for strip generation");
      setStripPreview(null);
      return;
    }

    await drawTemplateBackground(ctx, template, stripTotalWidth, stripTotalHeight, stripCount);

    if (images.length === 0 && stripCount > 0) {
      ctx.fillStyle = (template.type === "solid" && template.color === "#000000") || (Array.isArray(template.color) && template.color.includes("#000000")) ? "#FFFFFF" : "#333333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.min(stripTotalWidth / 12, 16)}px Arial`;
      ctx.fillText( `Capture ${stripCount} photos!`, stripTotalWidth / 2, stripTotalHeight / 2 );
      setStripPreview(canvas.toDataURL("image/png"));
      return;
    }
    
    const imagePromises = images.slice(0, stripCount).map(src => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => {
          console.error("Failed to load image for strip:", src, e);
          const placeholder = document.createElement('canvas');
          const { width: frameW, height: frameH } = calculateFrameLayout(stripTotalWidth, stripTotalHeight, stripCount, 0); // Get typical frame size
          placeholder.width = frameW > 0 ? frameW : 100;
          placeholder.height = frameH > 0 ? frameH : (frameW > 0 ? frameW / FRAME_ASPECT_RATIO : 75);
          const pCtx = placeholder.getContext('2d');
          if (pCtx) {
            pCtx.fillStyle = '#dddddd'; pCtx.fillRect(0,0,placeholder.width, placeholder.height);
            pCtx.fillStyle = '#aaaaaa'; pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
            pCtx.font = `${Math.min(placeholder.width/6, 12)}px Arial`;
            pCtx.fillText('Error', placeholder.width/2, placeholder.height/2);
          }
          const errorImg = new window.Image();
          errorImg.src = placeholder.toDataURL();
          errorImg.onload = () => resolve(errorImg);
          errorImg.onerror = () => reject(new Error(`Failed to create placeholder for ${src}`));
        };
        img.src = src;
      });
    });

    try {
      const loadedImages = await Promise.all(imagePromises);
      for (let i = 0; i < loadedImages.length; i++) {
        const imgToDraw = loadedImages[i];
        const { x, y, width, height } = calculateFrameLayout(stripTotalWidth, stripTotalHeight, stripCount, i);
        drawRoundedImageWithCover(ctx, imgToDraw, x, y, width, height);
      }

      stamps.forEach(({ x: stampX, y: stampY, emoji }) => {
        ctx.font = "24px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const finalStampX = Math.max(12, Math.min(stampX, stripTotalWidth - 12));
        const finalStampY = Math.max(12, Math.min(stampY, stripTotalHeight - 12));
        ctx.fillText(emoji, finalStampX, finalStampY);
      });

      if (customText) {
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = (template.type === "solid" && template.color === "#000000") || (Array.isArray(template.color) && template.color.includes("#000000")) ? "#FFFFFF" : "#000000";
        ctx.textAlign = "center";
        ctx.fillText(customText, stripTotalWidth / 2, stripTotalHeight - 20);
      }
    } catch (error) {
      console.error("Error processing images for canvas strip:", error);
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)"; ctx.fillRect(0, 0, stripTotalWidth, stripTotalHeight);
      ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Error generating preview.", stripTotalWidth / 2, stripTotalHeight / 2);
    }
    
    setStripPreview(canvas.toDataURL("image/png"));
  }, [stripCount, images, stamps, customText, template]);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      generateStrip();
    }, 250); // Debounce time

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [generateStrip]); // generateStrip dependencies cover images, stamps, customText, etc.

  return stripPreview;
}