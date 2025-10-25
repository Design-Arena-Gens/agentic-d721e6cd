"use client";

import type { EnhancedImage, VideoRenderState } from "@/types";

type Props = {
  state: VideoRenderState;
  source?: EnhancedImage;
  onRender: () => void;
  onReset: () => void;
};

export function VideoComposerPanel({ state, source, onRender, onReset }: Props) {
  return (
    <div className="card" style={{ display: "grid", gap: 20 }}>
      <div className="pill" style={{ alignSelf: "flex-start" }}>
        Vidéo UGC 15s
      </div>

      {!source && (
        <p style={{ margin: 0, color: "rgba(226,232,240,0.7)" }}>
          Sélectionnez une image optimisée pour générer une capsule vidéo verticale TikTok / Reels.
        </p>
      )}

      {source && (
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            background: "rgba(15,23,42,0.65)",
            border: "1px solid rgba(148,163,184,0.2)",
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 16,
            alignItems: "center",
            padding: 12,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={source.enhancedUrl}
            alt="Source vidéo"
            style={{ width: "100%", display: "block", aspectRatio: "2 / 3", objectFit: "cover" }}
          />
          <div style={{ display: "grid", gap: 6 }}>
            <strong>Source sélectionnée</strong>
            <span style={{ color: "rgba(226,232,240,0.7)" }}>
              {source.detectedItems.length
                ? `Focus : ${source.detectedItems.join(", ")}`
                : "Style original respecté"}
            </span>
          </div>
        </div>
      )}

      <div>
        {state.status === "idle" && (
          <button
            type="button"
            className="button"
            onClick={onRender}
            disabled={!source}
          >
            Générer la vidéo
          </button>
        )}

        {state.status === "preparing" && (
          <p style={{ margin: 0, color: "rgba(226,232,240,0.8)" }}>
            Préparation des frames… (~{(state.progress * 100).toFixed(0)}%)
          </p>
        )}

        {state.status === "rendering" && (
          <p style={{ margin: 0, color: "rgba(226,232,240,0.8)" }}>
            Encodage mp4 (libx264)… {(state.progress * 100).toFixed(0)}%
          </p>
        )}

        {state.status === "error" && (
          <div style={{ color: "#fca5a5", display: "grid", gap: 12 }}>
            <p style={{ margin: 0 }}>{state.error}</p>
            <button type="button" className="button secondary" onClick={onReset}>
              Réinitialiser
            </button>
          </div>
        )}

        {state.status === "ready" && state.videoUrl && (
          <div style={{ display: "grid", gap: 12 }}>
            <video
              controls
              playsInline
              style={{ width: "100%", borderRadius: 18, border: "1px solid rgba(148,163,184,0.2)" }}
              src={state.videoUrl}
            />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="button" href={state.videoUrl} download="ugc-video.mp4">
                Télécharger la vidéo
              </a>
              <button type="button" className="button secondary" onClick={onReset}>
                Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
