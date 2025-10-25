"use client";

export function Hero() {
  return (
    <header
      style={{
        paddingBlock: 48,
        display: "grid",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div className="pill" style={{ justifySelf: "center" }}>
        Mode UGC assisté par IA
      </div>
      <h1 style={{ margin: 0, fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>
        Optimisez vos visuels, livrez une capsule mode prête à poster
      </h1>
      <p
        style={{
          margin: "0 auto",
          maxWidth: 680,
          fontSize: 18,
          color: "rgba(226,232,240,0.75)",
          lineHeight: 1.6,
        }}
      >
        Importez vos images (shootings, packshots, lookbook). L’agent améliore la qualité sans toucher
        aux visages ni à la composition, identifie le look et génère une vidéo verticale 100% UGC avec
        narration prête à diffuser sur TikTok / Reels.
      </p>
    </header>
  );
}
