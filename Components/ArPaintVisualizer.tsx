"use client";

import { Camera, Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Finish = "gloss" | "metallic" | "matte";

type RawMask = {
  data?: ArrayLike<number>;
  width?: number;
  height?: number;
};

type SegmentationResult = {
  label?: string;
  score?: number;
  mask?: RawMask;
};

type Segmenter = (input: HTMLCanvasElement) => Promise<SegmentationResult[]>;

const COLORS = [
  { name: "Obsidian Black", value: "#111111" },
  { name: "Pearl White", value: "#f4f1eb" },
  { name: "Silver", value: "#aeb4ba" },
  { name: "Deep Red", value: "#a10f14" },
  { name: "Royal Blue", value: "#164d8b" },
  { name: "Racing Green", value: "#0c4a32" },
  { name: "Champagne", value: "#bda57d" },
  { name: "Graphite", value: "#686d70" },
];

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) {
    const value = Math.round(l * 255);
    return [value, value, value];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function getMaskSize(mask: RawMask) {
  return {
    width: mask.width ?? 0,
    height: mask.height ?? 0,
  };
}

function maskValue(mask: RawMask, index: number) {
  const value = Number(mask.data?.[index] ?? 0);
  return value <= 1 ? value * 255 : value;
}

export default function ArPaintVisualizer({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const segmenterRef = useRef<Segmenter | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const stoppedRef = useRef(false);

  const [color, setColor] = useState(COLORS[3].value);
  const [finish, setFinish] = useState<Finish>("gloss");
  const [status, setStatus] = useState("Starting camera…");
  const [modelStatus, setModelStatus] = useState("Loading vehicle detection…");
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const stopEverything = () => {
    stoppedRef.current = true;
    if (frameTimerRef.current !== null) {
      window.clearTimeout(frameTimerRef.current);
      frameTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    stoppedRef.current = false;

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported by this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (stoppedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("Point the camera at your car");

        const moduleUrl =
          "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm";
        const hf = await import(/* webpackIgnore: true */ moduleUrl);

        // WASM is intentionally forced here. It is much more reliable on iPhone
        // than allowing the runtime to choose a threaded/WebGPU backend.
        hf.env.backends.onnx.wasm.numThreads = 1;
        hf.env.backends.onnx.wasm.simd = true;
        hf.env.backends.onnx.wasm.proxy = false;

        const pipe = await hf.pipeline(
          "image-segmentation",
          "Xenova/segformer-b0-finetuned-cityscapes-640-1280",
          { device: "wasm" },
        );

        segmenterRef.current = pipe as unknown as Segmenter;
        setModelStatus("Vehicle detection ready");
        setStatus("Vehicle detection ready • choose your color");
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to start the camera or vehicle detector.",
        );
        setStatus("Camera unavailable");
      }
    };

    void start();

    return () => {
      stopEverything();
    };
  }, []);

  useEffect(() => {
    const draw = async () => {
      const video = videoRef.current;
      const overlay = overlayRef.current;
      const work = workRef.current;
      const segmenter = segmenterRef.current;

      if (
        stoppedRef.current ||
        !video ||
        !overlay ||
        !work ||
        !segmenter ||
        video.readyState < 2 ||
        busyRef.current
      ) {
        frameTimerRef.current = window.setTimeout(draw, 500);
        return;
      }

      busyRef.current = true;

      try {
        const displayWidth = video.clientWidth || 720;
        const displayHeight = video.clientHeight || 480;
        const sourceWidth = Math.min(video.videoWidth || 1280, 960);
        const sourceHeight = Math.round(
          sourceWidth * (video.videoHeight / video.videoWidth || 0.5625),
        );

        work.width = sourceWidth;
        work.height = sourceHeight;
        overlay.width = sourceWidth;
        overlay.height = sourceHeight;
        overlay.style.width = `${displayWidth}px`;
        overlay.style.height = `${displayHeight}px`;

        const workCtx = work.getContext("2d", { willReadFrequently: true });
        const overlayCtx = overlay.getContext("2d", {
          willReadFrequently: true,
        });
        if (!workCtx || !overlayCtx) throw new Error("Canvas is unavailable.");

        workCtx.drawImage(video, 0, 0, sourceWidth, sourceHeight);
        const results = await segmenter(work);
        if (stoppedRef.current) return;

        const cars = results.filter(
          (item) =>
            item.label?.toLowerCase() === "car" &&
            item.mask?.data &&
            item.mask.width &&
            item.mask.height,
        );

        overlayCtx.clearRect(0, 0, sourceWidth, sourceHeight);

        if (!cars.length) {
          setDetected(false);
          setStatus("Point the camera at the side or front of your car");
          return;
        }

        // Cityscapes semantic segmentation gives a single car mask. If the
        // model returns multiple car masks, merge them instead of accidentally
        // choosing the background mask.
        const firstMask = cars[0].mask as RawMask;
        const { width: maskWidth, height: maskHeight } = getMaskSize(firstMask);
        const merged = new Uint8Array(sourceWidth * sourceHeight);

        for (const item of cars) {
          const mask = item.mask as RawMask;
          const size = getMaskSize(mask);
          if (size.width !== maskWidth || size.height !== maskHeight) continue;

          for (let y = 0; y < sourceHeight; y += 1) {
            const my = Math.min(
              maskHeight - 1,
              Math.floor((y / sourceHeight) * maskHeight),
            );
            for (let x = 0; x < sourceWidth; x += 1) {
              const mx = Math.min(
                maskWidth - 1,
                Math.floor((x / sourceWidth) * maskWidth),
              );
              const mv = maskValue(mask, my * maskWidth + mx);
              if (mv > 100) merged[y * sourceWidth + x] = Math.max(merged[y * sourceWidth + x], mv);
            }
          }
        }

        const frame = workCtx.getImageData(0, 0, sourceWidth, sourceHeight);
        const pixels = frame.data;
        const target = hexToRgb(color);
        const targetHsl = rgbToHsl(target.r, target.g, target.b);

        for (let i = 0; i < merged.length; i += 1) {
          const alpha = merged[i] / 255;
          if (alpha < 0.35) continue;

          const p = i * 4;
          const r = pixels[p];
          const g = pixels[p + 1];
          const b = pixels[p + 2];
          const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

          // Keep tires, deep glass, grilles and badges mostly untouched.
          // This prevents the entire car mask from becoming one flat color.
          if (luminance < 0.12) continue;

          const sourceHsl = rgbToHsl(r, g, b);
          let saturation = Math.max(targetHsl.s, 0.38);
          let lightness = sourceHsl.l * 0.72 + targetHsl.l * 0.28;

          if (finish === "matte") {
            saturation *= 0.84;
            lightness = Math.min(0.86, lightness * 0.94);
          } else if (finish === "metallic") {
            saturation = Math.min(1, saturation * 1.05);
            lightness = Math.min(0.94, lightness * 1.03);
          } else {
            lightness = Math.min(0.95, lightness * 1.02);
          }

          const [nr, ng, nb] = hslToRgb(targetHsl.h, saturation, lightness);
          const strength = Math.min(0.9, alpha * (0.74 + luminance * 0.22));
          pixels[p] = Math.round(r * (1 - strength) + nr * strength);
          pixels[p + 1] = Math.round(g * (1 - strength) + ng * strength);
          pixels[p + 2] = Math.round(b * (1 - strength) + nb * strength);
        }

        workCtx.putImageData(frame, 0, 0);
        overlayCtx.clearRect(0, 0, sourceWidth, sourceHeight);
        overlayCtx.globalAlpha = 1;
        overlayCtx.drawImage(work, 0, 0);
        setDetected(true);
        setStatus("Vehicle detected • choose your color");
      } catch (err) {
        console.error(err);
        setStatus("Vehicle detection is retrying…");
      } finally {
        busyRef.current = false;
        if (!stoppedRef.current) {
          frameTimerRef.current = window.setTimeout(draw, 850);
        }
      }
    };

    const timer = window.setTimeout(draw, 900);
    return () => window.clearTimeout(timer);
  }, [color, finish, modelStatus]);

  const takePhoto = () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;

    const canvas = document.createElement("canvas");
    canvas.width = overlay.width || video.videoWidth;
    canvas.height = overlay.height || video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.88));
  };

  const resetPhoto = () => setPhoto(null);

  const requestColor = () => {
    const selected = COLORS.find((item) => item.value === color);
    const message = encodeURIComponent(
      `I would like to request ${selected?.name ?? color} in ${finish} finish for my vehicle.`,
    );
    window.location.href = `mailto:info@ajdal.com?subject=Ajdal Paint Studio Request&body=${message}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082F2F]/95 p-0 sm:p-5">
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#F5F0EA] sm:h-[94vh] sm:border sm:border-[#BD9872]/30">
        <header className="flex shrink-0 items-center justify-between bg-[#0F4545] px-6 py-5 text-white sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#BD9872]">
              Ajdal Paint Studio
            </p>
            <h2 className="mt-1 text-2xl font-semibold uppercase sm:text-3xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopEverything();
              onClose();
            }}
            className="flex h-12 w-12 items-center justify-center border border-white/20 text-white transition hover:bg-white/10"
            aria-label="Close paint studio"
          >
            <X size={28} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="relative aspect-[4/5] min-h-[330px] w-full overflow-hidden bg-black sm:aspect-video">
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
            />
            <canvas
              ref={overlayRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <canvas ref={workRef} className="hidden" />

            <div className="absolute left-5 top-5 bg-[#0F4545]/95 px-5 py-4 text-white sm:left-8 sm:top-8">
              <p className="text-sm sm:text-base">{status}</p>
              <p className="mt-1 text-xs text-white/60">{modelStatus}</p>
            </div>

            {error && (
              <div className="absolute inset-x-5 bottom-5 bg-[#0F4545]/95 p-4 text-sm text-white sm:inset-x-8">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={takePhoto}
              className="absolute bottom-5 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-[#BD9872] text-[#0F4545] shadow-xl transition hover:scale-105"
              aria-label="Take photo"
            >
              <Camera size={28} />
            </button>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#BD9872]">Choose Your Finish</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {(["gloss", "metallic", "matte"] as Finish[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFinish(item)}
                    className={`min-h-14 border px-3 py-3 text-sm font-semibold uppercase transition ${
                      finish === item
                        ? "border-[#0F4545] bg-[#0F4545] text-white"
                        : "border-black/15 bg-white text-[#0F4545] hover:border-[#BD9872]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#BD9872]">Paint Color</p>
              <div className="mt-5 grid grid-cols-4 gap-5 sm:grid-cols-8">
                {COLORS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setColor(item.value)}
                    className="group flex flex-col items-center gap-2"
                    aria-label={item.name}
                  >
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#F5F0EA] shadow-sm ring-1 ring-black/10 transition sm:h-16 sm:w-16 ${
                        color === item.value ? "ring-2 ring-[#BD9872] ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: item.value }}
                    >
                      {color === item.value && <Check className="text-white drop-shadow" size={25} />}
                    </span>
                    <span className="text-center text-[10px] font-medium uppercase text-[#0F4545]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetPhoto}
                disabled={!photo}
                className="flex min-h-14 items-center justify-center gap-2 border border-[#0F4545] bg-transparent px-5 font-semibold uppercase text-[#0F4545] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={18} />
                Back To Camera
              </button>
              <button
                type="button"
                onClick={requestColor}
                className="min-h-14 flex-1 bg-[#0F4545] px-5 font-semibold uppercase text-white transition hover:bg-[#082F2F]"
              >
                Request This Color
              </button>
            </div>

            {photo && (
              <div className="mt-6 overflow-hidden border border-black/10 bg-white">
                <img src={photo} alt="Your vehicle paint preview" className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
