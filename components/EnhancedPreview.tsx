"use client";

import type { EnhancedImage } from "@/types";

type Props = {
  items: EnhancedImage[];
  onSelect?: (item: EnhancedImage) => void;
};

export function EnhancedPreview({ items, onSelect }: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="grid two">
      {items.map((item, index) => (
        <article key={item.enhancedUrl} className="card fade-in" style={{ gap: 20, display: "grid" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="pill">Visuel optimisé #{index + 1}</div>
            <span className="badge">{item.width} × {item.height}px</span>
          </header>
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.enhancedUrl}
              alt={`Image optimisée ${index + 1}`}
              style={{ width: "100%", display: "block" }}
              onClick={() => onSelect?.(item)}
            />
          </div>
          <section style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Éléments identifiés</h3>
            {item.detectedItems.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {item.detectedItems.map((label) => (
                  <span
                    key={label}
                    className="badge"
                    style={{ background: "rgba(79,70,229,0.2)", borderColor: "rgba(79,70,229,0.4)" }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "rgba(226,232,240,0.65)" }}>
                Aucun vêtement clairement détecté. Nous préservons totalement votre visuel d’origine.
              </p>
            )}
          </section>

          <section style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Script UGC proposé</h3>
            <p style={{ margin: 0, color: "rgba(226,232,240,0.75)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {item.narrative}
            </p>
          </section>

          <footer style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              className="button"
              style={{ textDecoration: "none" }}
              href={item.enhancedUrl}
              download={`ugc-image-enhanced-${index + 1}.png`}
            >
              Télécharger l’image
            </a>
            {onSelect && (
              <button
                type="button"
                className="button secondary"
                onClick={() => onSelect(item)}
              >
                Utiliser pour la vidéo
              </button>
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}
