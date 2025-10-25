"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onFiles: (files: File[]) => void;
};

export function Dropzone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(false);
      const files = Array.from(event.dataTransfer.files).filter((file) =>
        /^image\/(png|jpe?g|webp)$/i.test(file.type)
      );
      if (files.length) {
        onFiles(files);
      }
    },
    [onFiles]
  );

  const handleSelect = useCallback(() => {
    const files = inputRef.current?.files ? Array.from(inputRef.current.files) : [];
    const valid = files.filter((file) => /^image\/(png|jpe?g|webp)$/i.test(file.type));
    if (valid.length) {
      onFiles(valid);
    }
  }, [onFiles]);

  return (
    <div
      className="card"
      style={{
        padding: 32,
        borderStyle: "dashed",
        borderColor: isOver ? "rgba(79, 70, 229, 0.6)" : "var(--border)",
        borderWidth: 2,
        transition: "border-color 0.2s ease",
        cursor: "pointer",
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        hidden
        onChange={handleSelect}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div className="pill">Importer vos visuels</div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: "12px 0 8px 0", fontSize: 24 }}>Droppez / sélectionnez vos images</h2>
          <p style={{ margin: 0, color: "rgba(226,232,240,0.7)" }}>
            Formats acceptés : .png, .jpg, .jpeg, .webp — sans modification du visage ni du style.
          </p>
        </div>
        <button type="button" className="button secondary">
          Parcourir vos fichiers
        </button>
      </div>
    </div>
  );
}
