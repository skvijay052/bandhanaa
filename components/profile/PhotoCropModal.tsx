"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Crop,
  ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

type Position = { x: number; y: number };
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function drawCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  zoom: number,
  position: Position,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  const scale =
    Math.max(size / image.naturalWidth, size / image.naturalHeight) * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = clamp(position.x, -(width - size) / 2, (width - size) / 2);
  const y = clamp(position.y, -(height - size) / 2, (height - size) / 2);
  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    (size - width) / 2 + x,
    (size - height) / 2 + y,
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
  const dragRef = useRef<{
    id: number;
    x: number;
    y: number;
    start: Position;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setReady(false);
    setError("");
    const image = new window.Image();
    image.onload = () => {
      imageRef.current = image;
      setReady(true);
      if (canvasRef.current)
        drawCrop(canvasRef.current, image, 1, { x: 0, y: 0 });
    };
    image.onerror = () =>
      setError("We couldn't load this image. Please choose another photo.");
    image.src = source;
    return () => {
      imageRef.current = null;
    };
  }, [source]);

  useEffect(() => {
    if (canvasRef.current && imageRef.current)
      drawCrop(canvasRef.current, imageRef.current, zoom, position);
  }, [position, zoom]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, saving]);

  function changeZoom(value: number) {
    setZoom(clamp(Number(value.toFixed(2)), 1, 3));
  }

  function startDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!ready || saving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start: position,
    };
    setDragging(true);
  }

  function moveDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas || drag.id !== event.pointerId) return;
    const ratio = canvas.width / canvas.getBoundingClientRect().width;
    setPosition({
      x: drag.start.x + (event.clientX - drag.x) * ratio,
      y: drag.start.y + (event.clientY - drag.y) * ratio,
    });
  }

  function stopDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }

  async function confirm() {
    if (!imageRef.current || saving) return;
    setSaving(true);
    setError("");
    const output = document.createElement("canvas");
    output.width = 1000;
    output.height = 1000;
    drawCrop(output, imageRef.current, zoom, position);
    const blob = await new Promise<Blob | null>((resolve) =>
      output.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) {
      setError("The cropped image could not be created. Please try again.");
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
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      aria-describedby="crop-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onCancel();
      }}
    >
      <section className="my-auto w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
        <header className="flex items-center border-b border-[#eceef2] px-5 py-4 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-black text-white">
            <Crop size={19} />
          </span>
          <div className="ml-3 min-w-0">
            <h2
              id="crop-title"
              className="text-[17px] font-bold text-[#111318]"
            >
              Adjust your photo
            </h2>
            <p
              id="crop-description"
              className="mt-0.5 text-[12px] text-[#687082]"
            >
              Drag to reposition, then zoom until it looks right.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close image editor"
            className="ml-auto grid size-9 shrink-0 place-items-center rounded-full text-[#515866] transition-colors hover:bg-[#f1f2f5] hover:text-black disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </header>

        <div className="bg-[#f5f6f8] px-4 py-5 sm:px-7 sm:py-6">
          <div className="relative mx-auto aspect-square w-full max-w-[390px] overflow-hidden rounded-2xl bg-[#dfe2e7] shadow-inner">
            {!ready && !error ? (
              <div className="absolute inset-0 grid place-items-center text-[#697181]">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="animate-pulse" size={30} />
                  <span className="text-[12px] font-medium">
                    Preparing your photo…
                  </span>
                </div>
              </div>
            ) : null}
            <canvas
              ref={canvasRef}
              width={1000}
              height={1000}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              className={`h-full w-full touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10"
            />
            {ready ? (
              <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur">
                Drag photo to reposition
              </span>
            ) : null}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <label
              htmlFor="photo-zoom"
              className="text-[13px] font-semibold text-[#20242b]"
            >
              Zoom
            </label>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              disabled={saving || !ready}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-[#596172] hover:bg-[#f2f3f5] hover:text-black disabled:opacity-40"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => changeZoom(zoom - 0.1)}
              disabled={saving || !ready || zoom <= 1}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dfe2e8] hover:border-black disabled:opacity-35"
            >
              <Minus size={16} />
            </button>
            <input
              id="photo-zoom"
              type="range"
              min="1"
              max="3"
              step=".02"
              value={zoom}
              onChange={(event) => changeZoom(Number(event.target.value))}
              disabled={saving || !ready}
              className="h-1.5 w-full cursor-pointer accent-black disabled:cursor-not-allowed"
            />
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => changeZoom(zoom + 0.1)}
              disabled={saving || !ready || zoom >= 3}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dfe2e8] hover:border-black disabled:opacity-35"
            >
              <Plus size={16} />
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-[12px] leading-5 text-red-700"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="h-11 rounded-xl border border-[#d9dde4] bg-white text-[13px] font-semibold hover:border-black hover:bg-[#f7f7f8] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={saving || !ready}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  Uploading…
                </>
              ) : (
                <>
                  <Check size={17} />
                  Save photo
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-[#858c99]">
            Your photo will be saved as a high-quality square image.
          </p>
        </div>
      </section>
    </div>
  );
}
