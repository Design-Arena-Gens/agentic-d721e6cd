"use client";

import { useCallback, useMemo, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { EnhancementControls } from "@/components/EnhancementControls";
import { EnhancedPreview } from "@/components/EnhancedPreview";
import { VideoComposerPanel } from "@/components/VideoComposerPanel";
import { Hero } from "@/components/Hero";
import { DEFAULT_SETTINGS, useImageEnhancer } from "@/hooks/useImageEnhancer";
import { useVideoComposer } from "@/hooks/useVideoComposer";
import type { EnhancementSettings, EnhancedImage } from "@/types";

export default function Page() {
  const [settings, setSettings] = useState<EnhancementSettings>(DEFAULT_SETTINGS);
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [videoSource, setVideoSource] = useState<EnhancedImage | undefined>();

  const { enhanced, enhance, isEnhancing, error, reset } = useImageEnhancer();
  const { state: videoState, compose, reset: resetVideo } = useVideoComposer();

  const handleFiles = useCallback(
    (files: File[]) => {
      setSourceFiles(files);
      setVideoSource(undefined);
      resetVideo();
      void enhance(files, settings);
    },
    [enhance, resetVideo, settings]
  );

  const handleSettingsChange = useCallback((next: EnhancementSettings) => {
    setSettings(next);
  }, []);

  const reprocess = useCallback(() => {
    if (sourceFiles.length) {
      void enhance(sourceFiles, settings);
    }
  }, [enhance, settings, sourceFiles]);

  const clearAll = useCallback(() => {
    reset();
    resetVideo();
    setSourceFiles([]);
    setVideoSource(undefined);
  }, [reset, resetVideo]);

  const canReprocess = useMemo(() => sourceFiles.length > 0 && !isEnhancing, [sourceFiles, isEnhancing]);

  const renderVideo = useCallback(() => {
    if (videoSource) {
      void compose(videoSource);
    }
  }, [compose, videoSource]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px 24px" }}>
      <Hero />
      <section className="grid two" style={{ marginBottom: 32 }}>
        <Dropzone onFiles={handleFiles} />
        <EnhancementControls settings={settings} onChange={handleSettingsChange} disabled={isEnhancing} />
      </section>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <button
          type="button"
          className="button"
          onClick={reprocess}
          disabled={!canReprocess}
        >
          {!isEnhancing ? "Appliquer les réglages" : "Optimisation en cours…"}
        </button>
        <button type="button" className="button secondary" onClick={clearAll}>
          Réinitialiser
        </button>
        {sourceFiles.length > 0 && (
          <span className="ticker">Images chargées : {sourceFiles.length}</span>
        )}
      </section>

      {error && (
        <div className="card" style={{ borderColor: "rgba(248,113,113,0.45)", color: "#fecaca", marginBottom: 24 }}>
          {error}
        </div>
      )}

      <EnhancedPreview
        items={enhanced}
        onSelect={(item) => {
          setVideoSource(item);
          resetVideo();
        }}
      />

      <div style={{ height: 32 }} />

      <VideoComposerPanel
        state={videoState}
        source={videoSource}
        onRender={renderVideo}
        onReset={() => {
          resetVideo();
          setVideoSource(undefined);
        }}
      />
    </div>
  );
}
