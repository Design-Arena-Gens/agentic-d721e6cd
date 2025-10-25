import { useCallback, useMemo, useRef, useState } from "react";
import type { EnhancedImage, VideoRenderState } from "@/types";

type FFmpegInstance = {
  load: () => Promise<void>;
  run: (...args: string[]) => Promise<void>;
  FS: (method: string, ...args: unknown[]) => any;
  setProgress: (callback: (progress: { ratio: number }) => void) => void;
};

declare global {
  interface Window {
    FFmpeg?: {
      createFFmpeg: (options: { log: boolean; corePath: string }) => FFmpegInstance;
    };
  }
}

const FFMPEG_SCRIPT = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.6/dist/ffmpeg.min.js";
const FFMPEG_CORE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js";

let ffmpegScriptPromise: Promise<void> | null = null;

function ensureScriptLoaded(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.ready === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error(`Échec du chargement : ${src}`)));
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.ready = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.body.appendChild(script);
  });
}

type FrameAsset = { name: string; data: Uint8Array };

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const FPS = 20;
const DURATION_SECONDS = 12;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  return canvas;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Chargement de l'image impossible pour la vidéo."));
    image.src = url;
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  narrativeLines: string[],
  frameIndex: number
) {
  ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, VIDEO_HEIGHT);
  gradient.addColorStop(0, "rgba(15,23,42,0.95)");
  gradient.addColorStop(0.45, "rgba(15,23,42,0.65)");
  gradient.addColorStop(1, "rgba(15,23,42,0.95)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  const progress = frameIndex / TOTAL_FRAMES;
  const zoom = 1.05 + progress * 0.08;
  const imageAspect = image.width / image.height;
  const targetWidth = VIDEO_WIDTH * 0.86;
  const targetHeight = targetWidth / imageAspect;
  const finalWidth = targetWidth * zoom;
  const finalHeight = targetHeight * zoom;
  const offsetX = (VIDEO_WIDTH - finalWidth) / 2;
  const offsetY = VIDEO_HEIGHT * 0.15 - (finalHeight - targetHeight) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(15, 15, 15, 0.35)";
  ctx.shadowBlur = 35;
  ctx.drawImage(image, offsetX, offsetY, finalWidth, finalHeight);
  ctx.restore();

  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.fillRect(48, VIDEO_HEIGHT * 0.62, VIDEO_WIDTH - 96, VIDEO_HEIGHT * 0.26);

  ctx.fillStyle = "#c7d2fe";
  ctx.font = "600 28px 'Inter', sans-serif";
  ctx.fillText("Look & Feel", 64, VIDEO_HEIGHT * 0.65);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "400 26px 'Inter', sans-serif";
  narrativeLines.forEach((line, index) => {
    ctx.fillText(line, 64, VIDEO_HEIGHT * 0.69 + index * 36);
  });

  ctx.fillStyle = "#a855f7";
  ctx.font = "500 22px 'Inter', sans-serif";
  const statusText = progress < 0.33 ? "Style" : progress < 0.66 ? "Confort" : "Attitude";
  ctx.fillText(statusText, 64, VIDEO_HEIGHT * 0.9);

  ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
  ctx.font = "400 20px 'Inter', sans-serif";
  ctx.fillText("@studio-ugc", 64, VIDEO_HEIGHT * 0.935);
}

async function generateFrames(image: EnhancedImage): Promise<FrameAsset[]> {
  const canvas = createCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de préparer le canevas vidéo.");
  }

  const baseImage = await loadImage(image.enhancedUrl);
  const narrativeLines = image.narrative.split("\n").map((line) => line.trim()).filter(Boolean);

  const frames: FrameAsset[] = [];
  for (let i = 0; i < TOTAL_FRAMES; i += 1) {
    drawFrame(ctx, baseImage, narrativeLines, i);
    // Soft breathing animation overlay
    const pulse = 0.2 + Math.sin((i / TOTAL_FRAMES) * Math.PI * 2) * 0.2;
    ctx.fillStyle = `rgba(79, 70, 229, ${pulse * 0.35})`;
    roundedRectPath(ctx, VIDEO_WIDTH - 200, 92, 120, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.font = "500 18px 'Inter', sans-serif";
    ctx.fillText("UGC Mood", VIDEO_WIDTH - 182, 118);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((frameBlob) => {
        if (!frameBlob) {
          reject(new Error("Échec lors de la création d'une frame vidéo."));
        } else {
          resolve(frameBlob);
        }
      }, "image/png");
    });

    const arrayBuffer = await blob.arrayBuffer();
    frames.push({
      name: `frame_${String(i).padStart(4, "0")}.png`,
      data: new Uint8Array(arrayBuffer),
    });
  }

  return frames;
}

export function useVideoComposer() {
  const ffmpegRef = useRef<FFmpegInstance | null>(null);
  const [state, setState] = useState<VideoRenderState>({
    status: "idle",
    progress: 0,
  });

  const ensureFFmpeg = useCallback(async () => {
    if (typeof window === "undefined") {
      throw new Error("Le rendu vidéo n'est disponible que dans le navigateur.");
    }
    if (!ffmpegRef.current) {
      if (!ffmpegScriptPromise) {
        ffmpegScriptPromise = ensureScriptLoaded(FFMPEG_SCRIPT);
      }
      await ffmpegScriptPromise;
      if (!window.FFmpeg) {
        throw new Error("FFmpeg n'a pas pu être initialisé.");
      }
      const instance = window.FFmpeg.createFFmpeg({
        log: false,
        corePath: FFMPEG_CORE,
      });
      instance.setProgress(({ ratio }) => {
        setState((previous) => ({
          ...previous,
          progress: Math.min(1, ratio ?? 0),
        }));
      });
      await instance.load();
      ffmpegRef.current = instance;
    }
    return ffmpegRef.current;
  }, []);

  const compose = useCallback(
    async (image: EnhancedImage) => {
      setState({ status: "preparing", progress: 0 });
      try {
        const frames = await generateFrames(image);
        const ffmpeg = await ensureFFmpeg();

        frames.forEach((frame) => {
          ffmpeg.FS("writeFile", frame.name, frame.data);
        });

        setState({ status: "rendering", progress: 0 });

        await ffmpeg.run(
          "-framerate",
          String(FPS),
          "-pattern_type",
          "glob",
          "-i",
          "frame_*.png",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          "-vf",
          "pad=ceil(iw/2)*2:ceil(ih/2)*2",
          "ugc.mp4"
        );

        const data = ffmpeg.FS("readFile", "ugc.mp4");
        const blob = new Blob([data.buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        frames.forEach((frame) => {
          try {
            ffmpeg.FS("unlink", frame.name);
          } catch {
            /* noop */
          }
        });

        try {
          ffmpeg.FS("unlink", "ugc.mp4");
        } catch {
          /* noop */
        }

        setState({
          status: "ready",
          progress: 1,
          videoUrl: url,
          videoBlob: blob,
        });
      } catch (error) {
        setState({
          status: "error",
          progress: 0,
          error:
            error instanceof Error
              ? error.message
              : "Une erreur est survenue lors du rendu de la vidéo.",
        });
      }
    },
    [ensureFFmpeg]
  );

  const reset = useCallback(() => {
    setState((previous) => {
      if (previous.videoUrl) {
        URL.revokeObjectURL(previous.videoUrl);
      }
      return { status: "idle", progress: 0 };
    });
  }, []);

  return useMemo(
    () => ({
      state,
      compose,
      reset,
    }),
    [compose, reset, state]
  );
}
