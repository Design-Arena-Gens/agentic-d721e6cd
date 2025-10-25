export type EnhancementSettings = {
  upscaleFactor: 1 | 2 | 4;
  denoise: number;
  brightness: number;
  saturation: number;
  warmth: number;
};

export type EnhancedImage = {
  originalFile: File;
  enhancedBlob: Blob;
  enhancedUrl: string;
  width: number;
  height: number;
  settings: EnhancementSettings;
  detectedItems: string[];
  narrative: string;
};

export type VideoRenderState = {
  status: "idle" | "preparing" | "rendering" | "ready" | "error";
  progress: number;
  error?: string;
  videoUrl?: string;
  videoBlob?: Blob;
};
