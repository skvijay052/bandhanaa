"use client";
import { useEffect, useRef, useState } from "react";
import { Crop, X } from "lucide-react";

function drawCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  zoom: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  const scale =
    Math.max(size / image.naturalWidth, size / image.naturalHeight) * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.clearRect(0, 0, size, size);
  context.drawImage(
    image,
    (size - width) / 2,
    (size - height) / 2,
    width,
    height,
  );
}

export function PhotoCropModal({
  source,
  onCancel,
  onCrop,
}: {
  source: string;
  onCancel: () => void;
  onCrop: (blob: Blob) => Promise<void>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const image = new window.Image();
    image.onload = () => {
      imageRef.current = image;
      if (canvasRef.current) drawCrop(canvasRef.current, image, zoom);
    };
    image.onerror = () => setError("This image could not be loaded.");
    image.src = source;
    return () => {
      imageRef.current = null;
    };
  }, [source]);
  useEffect(() => {
    if (canvasRef.current && imageRef.current)
      drawCrop(canvasRef.current, imageRef.current, zoom);
  }, [zoom]);
  async function confirm() {
    if (!imageRef.current) return;
    setSaving(true);
    setError("");
    const output = document.createElement("canvas");
    output.width = 800;
    output.height = 800;
    drawCrop(output, imageRef.current, zoom);
    const blob = await new Promise<Blob | null>((resolve) =>
      output.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) {
      setError("The cropped image could not be created.");
      setSaving(false);
      return;
    }
    try {
      await onCrop(blob);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Upload failed. Please try again.",
      );
      setSaving(false);
    }
  }
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#0b0c18]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
    >
      <section className="w-full max-w-[430px] rounded-2xl bg-white p-5 shadow-2xl">
        <header className="flex items-center">
          <span className="grid size-9 place-items-center rounded-full bg-[#e8f5fe] text-[#1d9bf0]">
            <Crop size={18} />
          </span>
          <h2 id="crop-title" className="ml-3 text-[16px] font-bold">
            Crop your photo
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close crop dialog"
            className="ml-auto grid size-9 place-items-center rounded-full hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </header>
        <div className="mx-auto mt-5 aspect-square w-full max-w-[330px] overflow-hidden rounded-xl bg-slate-100">
          <canvas
            ref={canvasRef}
            width={800}
            height={800}
            className="h-full w-full"
          />
        </div>
        <label className="mt-5 block text-[11px] font-semibold">
          Zoom
          <input
            type="range"
            min="1"
            max="3"
            step=".05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="mt-2 w-full accent-[#1d9bf0]"
          />
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-[11px] text-red-600">
            {error}
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="h-10 rounded-lg border border-[#e2e3e9] text-[12px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => void confirm()}
            disabled={saving || Boolean(error)}
            className="h-10 rounded-lg bg-[#1d9bf0] text-[12px] font-semibold text-white hover:bg-[#1689df] disabled:opacity-60"
          >
            {saving ? "Uploading…" : "Crop & Upload"}
          </button>
        </div>
      </section>
    </div>
  );
}
