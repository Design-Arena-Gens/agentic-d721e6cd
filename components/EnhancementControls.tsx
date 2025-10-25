"use client";

import type { EnhancementSettings } from "@/types";

type Props = {
  settings: EnhancementSettings;
  onChange: (settings: EnhancementSettings) => void;
  disabled?: boolean;
};

export function EnhancementControls({ settings, onChange, disabled }: Props) {
  const handleChange = (key: keyof EnhancementSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="pill" style={{ alignSelf: "flex-start" }}>
        Réglages intelligents
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(226,232,240,0.75)" }}>Upscale</span>
          <select
            value={settings.upscaleFactor}
            disabled={disabled}
            onChange={(event) => handleChange("upscaleFactor", Number(event.target.value))}
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              background: "rgba(15,23,42,0.6)",
              border: "1px solid var(--border)",
              color: "inherit",
              fontSize: 16,
            }}
          >
            <option value={1}>Original</option>
            <option value={2}>×2</option>
            <option value={4}>×4</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(226,232,240,0.75)" }}>Débruitage</span>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={settings.denoise}
            disabled={disabled}
            onChange={(event) => handleChange("denoise", Number(event.target.value))}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(226,232,240,0.75)" }}>Luminosité</span>
          <input
            type="range"
            min={0.9}
            max={1.2}
            step={0.01}
            value={settings.brightness}
            disabled={disabled}
            onChange={(event) => handleChange("brightness", Number(event.target.value))}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(226,232,240,0.75)" }}>Couleurs naturelles</span>
          <input
            type="range"
            min={0.9}
            max={1.3}
            step={0.01}
            value={settings.saturation}
            disabled={disabled}
            onChange={(event) => handleChange("saturation", Number(event.target.value))}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 14, color: "rgba(226,232,240,0.75)" }}>Balance chaude</span>
          <input
            type="range"
            min={-0.3}
            max={0.3}
            step={0.01}
            value={settings.warmth}
            disabled={disabled}
            onChange={(event) => handleChange("warmth", Number(event.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
