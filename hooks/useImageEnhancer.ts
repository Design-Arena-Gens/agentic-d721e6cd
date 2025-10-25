import { useCallback, useMemo, useState } from "react";
import type { EnhancementSettings, EnhancedImage } from "@/types";
import { detectFashionItems } from "@/lib/detection";
import { buildNarrative } from "@/lib/ugcScript";

export const DEFAULT_SETTINGS: EnhancementSettings = {
  upscaleFactor: 2,
  denoise: 0.15,
  brightness: 1.06,
  saturation: 1.12,
  warmth: 0.12,
};

async function enhanceFile(
  file: File,
  settings: EnhancementSettings
): Promise<Omit<EnhancedImage, "detectedItems" | "narrative"> & { detectedItems: string[] }> {
  const bitmap = await createImageBitmap(file);
  const targetWidth = Math.round(bitmap.width * settings.upscaleFactor);
  const targetHeight = Math.round(bitmap.height * settings.upscaleFactor);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    bitmap.close();
    throw new Error("Impossible de préparer le contexte de dessin.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const blurRadius = (settings.denoise * 1.6).toFixed(2);
  const contrast = (1 + settings.denoise * 0.12).toFixed(2);

  ctx.filter = `brightness(${settings.brightness}) saturate(${settings.saturation}) contrast(${contrast})${
    settings.denoise > 0 ? ` blur(${blurRadius}px)` : ""
  }`;

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  if (settings.warmth !== 0) {
    const strength = Math.min(Math.max(settings.warmth, -0.5), 0.5);
    ctx.globalAlpha = Math.abs(strength);
    ctx.globalCompositeOperation = strength >= 0 ? "screen" : "multiply";
    ctx.fillStyle = strength >= 0 ? "rgba(255, 170, 120, 1)" : "rgba(120, 170, 255, 1)";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  const detectedItems = await detectFashionItems(canvas).catch(() => []);

  const enhancedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Impossible de générer l'image optimisée."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });

  bitmap.close();

  return {
    originalFile: file,
    enhancedBlob,
    enhancedUrl: URL.createObjectURL(enhancedBlob),
    width: targetWidth,
    height: targetHeight,
    settings,
    detectedItems,
  };
}

export function useImageEnhancer() {
  const [enhanced, setEnhanced] = useState<EnhancedImage[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhance = useCallback(
    async (files: File[], customSettings?: EnhancementSettings) => {
      if (!files.length) {
        return;
      }

      setIsEnhancing(true);
      setError(null);

      try {
        const settings = customSettings ?? DEFAULT_SETTINGS;
        const processed = await Promise.all(
          files.map(async (file) => {
            const base = await enhanceFile(file, settings);
            const narrative = buildNarrative(base.detectedItems);
            return {
              ...base,
              narrative,
            };
          })
        );

        setEnhanced((previous) => {
          previous.forEach((item) => URL.revokeObjectURL(item.enhancedUrl));
          return processed;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Amélioration impossible pour le moment.");
      } finally {
        setIsEnhancing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setEnhanced((previous) => {
      previous.forEach((item) => URL.revokeObjectURL(item.enhancedUrl));
      return [];
    });
    setError(null);
  }, []);

  return useMemo(
    () => ({
      enhanced,
      isEnhancing,
      error,
      enhance,
      reset,
    }),
    [enhanced, isEnhancing, error, enhance, reset]
  );
}
