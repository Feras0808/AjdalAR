"use client";

import { Camera, Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Finish = "Gloss" | "Metallic" | "Matte";

type Props = {
  service: "Custom Full Vehicle Painting" | "Peelable Paint Solutions";
  open: boolean;
  onClose: () => void;
};

const colors = [
  { name: "Obsidian Black", value: "#101112" },
  { name: "Pearl White", value: "#f4f3ee" },
  { name: "Platinum Silver", value: "#a9adb1" },
  { name: "Deep Red", value: "#8b1018" },
  { name: "Racing Blue", value: "#123e70" },
  { name: "British Green", value: "#173f2c" },
  { name: "Champagne", value: "#bca789" },
  { name: "Nardo Grey", value: "#777b7d" },
];

export default function ArPaintVisualizer({
  service,
  open,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);

  const runningRef = useRef(false);
  const busyRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  const lastProcessRef = useRef(0);

  const [color, setColor] = useState(colors[0].value);
  const [finish, setFinish] = useState<Finish>("Gloss");

  const [cameraError, setCameraError] = useState("");
  const [modelStatus, setModelStatus] =
    useState("Preparing camera…");

  const [captured, setCaptured] = useState<string | null>(null);

  /*
   * Stop camera + animation
   */
  const stopCamera = () => {
    runningRef.current = false;
    busyRef.current = false;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };

  /*
   * Start camera + AI
   */
  useEffect(() => {
    if (!open) {
      stopCamera();
      setCaptured(null);
      setCameraError("");
      return;
    }

    let cancelled = false;

    async function start() {
      try {
        setCameraError("");
        setModelStatus("Opening camera…");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access is not supported by this browser."
          );
        }

        /*
         * Mobile rear camera
         */
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          throw new Error("Video element unavailable.");
        }

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;

        await video.play();

        setModelStatus(
          "Loading vehicle detection AI…"
        );

        /*
         * Transformers.js is loaded only in the browser.
         */
        const dynamicImport = new Function(
          "url",
          "return import(url)"
        ) as (url: string) => Promise<any>;

        const transformers = await dynamicImport(
          "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm"
        );

        if (cancelled) return;

        /*
         * Force WASM for better compatibility on iPhone.
         */
        if (transformers.env) {
          transformers.env.allowLocalModels = false;
          transformers.env.useBrowserCache = true;

          if (transformers.env.backends?.onnx?.wasm) {
            transformers.env.backends.onnx.wasm.numThreads = 1;
          }
        }

        /*
         * IMPORTANT:
         *
         * This is Cityscapes, not the old ADE model.
         * Cityscapes contains a dedicated "car" class.
         */
        modelRef.current = await transformers.pipeline(
          "image-segmentation",
          "Xenova/segformer-b0-finetuned-cityscapes-512-1024",
          {
            device: "wasm",
          }
        );

        if (cancelled) return;

        setModelStatus(
          "Point your camera at the vehicle"
        );

        runningRef.current = true;

        animationRef.current =
          requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("AR startup error:", error);

        setCameraError(
          "Camera or vehicle detection could not start. Please allow camera access and try Safari or Chrome."
        );

        setModelStatus("Camera unavailable");
      }
    }

    start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open]);

  /*
   * Process camera frame
   */
  const processFrame = async () => {
    if (
      !runningRef.current ||
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const now = performance.now();

    /*
     * Don't overload iPhone.
     * Process approximately every 700ms.
     */
    if (
      now - lastProcessRef.current <
      700
    ) {
      animationRef.current =
        requestAnimationFrame(processFrame);

      return;
    }

    if (
      video.readyState < 2 ||
      busyRef.current ||
      !modelRef.current
    ) {
      animationRef.current =
        requestAnimationFrame(processFrame);

      return;
    }

    busyRef.current = true;
    lastProcessRef.current = now;

    try {
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        throw new Error(
          "Video dimensions unavailable."
        );
      }

      /*
       * Smaller inference image for mobile performance.
       */
      const input = document.createElement(
        "canvas"
      );

      const maxSide = 640;

      const scale = Math.min(
        1,
        maxSide /
          Math.max(width, height)
      );

      input.width = Math.max(
        1,
        Math.round(width * scale)
      );

      input.height = Math.max(
        1,
        Math.round(height * scale)
      );

      const inputContext =
        input.getContext("2d", {
          willReadFrequently: true,
        });

      const outputContext =
        canvas.getContext("2d", {
          willReadFrequently: true,
        });

      if (
        !inputContext ||
        !outputContext
      ) {
        throw new Error(
          "Canvas unavailable."
        );
      }

      /*
       * Draw current camera frame.
       */
      inputContext.drawImage(
        video,
        0,
        0,
        input.width,
        input.height
      );

      /*
       * Run segmentation.
       */
      const result =
        await modelRef.current(input);

      /*
       * Find the CAR class.
       */
      const carMaskResult =
        result?.find((item: any) => {
          const label = String(
            item?.label ?? ""
          ).toLowerCase();

          return (
            label === "car" ||
            label.includes("car")
          );
        });

      /*
       * Always draw the original camera.
       */
      canvas.width = width;
      canvas.height = height;

      outputContext.clearRect(
        0,
        0,
        width,
        height
      );

      outputContext.drawImage(
        video,
        0,
        0,
        width,
        height
      );

      if (
        !carMaskResult?.mask
      ) {
        setModelStatus(
          "Point your camera at the vehicle"
        );

        return;
      }

      const rawMask =
        carMaskResult.mask;

      const maskWidth =
        Number(rawMask.width) ||
        input.width;

      const maskHeight =
        Number(rawMask.height) ||
        input.height;

      const rawData =
        rawMask.data;

      if (!rawData) {
        setModelStatus(
          "Vehicle detection unavailable"
        );

        return;
      }

      /*
       * Convert the returned RawImage mask
       * into a simple single-channel mask.
       */
      const mask = normalizeMask(
        rawData,
        maskWidth,
        maskHeight
      );

      /*
       * Find the largest connected vehicle.
       */
      const mainComponent =
        largestComponent(
          mask,
          maskWidth,
          maskHeight,
          90
        );

      if (!mainComponent) {
        setModelStatus(
          "Move closer and point at the vehicle"
        );

        return;
      }

      /*
       * Get original camera pixels.
       */
      const frame =
        inputContext.getImageData(
          0,
          0,
          input.width,
          input.height
        );

      /*
       * Create recolored frame.
       */
      const painted =
        document.createElement(
          "canvas"
        );

      painted.width =
        input.width;

      painted.height =
        input.height;

      const paintedContext =
        painted.getContext("2d", {
          willReadFrequently: true,
        });

      if (!paintedContext) {
        throw new Error(
          "Paint canvas unavailable."
        );
      }

      const rgb =
        hexToRgb(color);

      const targetHsl =
        rgbToHsl(
          rgb.r,
          rgb.g,
          rgb.b
        );

      const output =
        paintedContext.createImageData(
          input.width,
          input.height
        );

      /*
       * Recolor only the car.
       */
      for (
        let y = 0;
        y < input.height;
        y++
      ) {
        for (
          let x = 0;
          x < input.width;
          x++
        ) {
          const outputIndex =
            (y * input.width + x) * 4;

          /*
           * Convert camera pixel to
           * segmentation coordinates.
           */
          const mx = Math.min(
            maskWidth - 1,
            Math.max(
              0,
              Math.round(
                (x /
                  input.width) *
                  (maskWidth - 1)
              )
            )
          );

          const my = Math.min(
            maskHeight - 1,
            Math.max(
              0,
              Math.round(
                (y /
                  input.height) *
                  (maskHeight - 1)
              )
            )
          );

          const maskIndex =
            my * maskWidth + mx;

          const alpha =
            mainComponent[
              maskIndex
            ] ?? 0;

          /*
           * Outside car.
           */
          if (alpha < 10) {
            continue;
          }

          const r =
            frame.data[
              outputIndex
            ];

          const g =
            frame.data[
              outputIndex + 1
            ];

          const b =
            frame.data[
              outputIndex + 2
            ];

          const originalHsl =
            rgbToHsl(r, g, b);

          /*
           * Very dark pixels are likely:
           *
           * - tires
           * - grilles
           * - vents
           * - deep gaps
           * - some glass
           *
           * Keep those mostly original.
           */
          const darkProtection =
            clamp(
              (0.22 -
                originalHsl.l) /
                0.22,
              0,
              1
            );

          /*
           * Very low saturation areas are
           * generally easier to recolor.
           */
          let paintStrength =
            alpha / 255;

          /*
           * Reduce strength on very dark areas.
           */
          paintStrength *=
            1 -
            darkProtection * 0.88;

          /*
           * Finish adjustments.
           */
          let targetSaturation =
            targetHsl.s;

          let brightnessFactor = 1;

          if (finish === "Matte") {
            targetSaturation *= 0.72;
            brightnessFactor = 0.92;
          }

          if (finish === "Metallic") {
            targetSaturation *= 0.95;
            brightnessFactor = 1.05;
          }

          if (finish === "Gloss") {
            targetSaturation *= 1;
            brightnessFactor = 1.03;
          }

          /*
           * Preserve the original body's
           * brightness and reflections.
           */
          let targetLightness =
            originalHsl.l *
            brightnessFactor;

          /*
           * Prevent extreme values.
           */
          targetLightness =
            clamp(
              targetLightness,
              0.08,
              0.92
            );

          targetSaturation =
            clamp(
              targetSaturation,
              0,
              1
            );

          const recolored =
            hslToRgb(
              targetHsl.h,
              targetSaturation,
              targetLightness
            );

          /*
           * Lower blending than before.
           * This lets the real car's
           * reflections remain visible.
           */
          const blend =
            clamp(
              paintStrength *
                (finish === "Gloss"
                  ? 0.78
                  : finish === "Metallic"
                  ? 0.72
                  : 0.64),
              0,
              0.86
            );

          if (blend < 0.01) {
            continue;
          }

          /*
           * Blend selected paint with
           * the original image.
           */
          output.data[
            outputIndex
          ] = Math.round(
            r * (1 - blend) +
              recolored.r * blend
          );

          output.data[
            outputIndex + 1
          ] = Math.round(
            g * (1 - blend) +
              recolored.g * blend
          );

          output.data[
            outputIndex + 2
          ] = Math.round(
            b * (1 - blend) +
              recolored.b * blend
          );

          output.data[
            outputIndex + 3
          ] = Math.round(
            blend * 255
          );
        }
      }

      paintedContext.putImageData(
        output,
        0,
        0
      );

      /*
       * Overlay ONLY the recolored pixels.
       *
       * Original camera remains underneath.
       */
      outputContext.drawImage(
        painted,
        0,
        0,
        width,
        height
      );

      setModelStatus(
        "Vehicle detected • choose your color"
      );
    } catch (error) {
      console.error(
        "AR processing error:",
        error
      );

      setModelStatus(
        "Move closer and point at the vehicle"
      );
    } finally {
      busyRef.current = false;

      if (runningRef.current) {
        animationRef.current =
          requestAnimationFrame(
            processFrame
          );
      }
    }
  };

  /*
   * Capture current AR preview.
   */
  const capture = () => {
    const video =
      videoRef.current;

    const overlay =
      canvasRef.current;

    if (!video || !overlay) {
      return;
    }

    const photo =
      document.createElement(
        "canvas"
      );

    photo.width =
      video.videoWidth;

    photo.height =
      video.videoHeight;

    const context =
      photo.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      overlay,
      0,
      0,
      photo.width,
      photo.height
    );

    setCaptured(
      photo.toDataURL(
        "image/jpeg",
        0.92
      )
    );
  };

  /*
   * Request selected color.
   */
  const requestColor = () => {
    const selected =
      colors.find(
        (item) =>
          item.value.toLowerCase() ===
          color.toLowerCase()
      );

    const colorName =
      selected?.name ??
      color.toUpperCase();

    stopCamera();
    onClose();

    const params =
      new URLSearchParams({
        service,
        paintColor:
          colorName,
        finish,
      });

    window.location.hash =
      `contact?${params.toString()}`;
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#061f1f]/95 p-3 sm:p-6">
      <div className="flex h-full max-h-[900px] w-full max-w-6xl flex-col overflow-hidden bg-[#F5F0EA] shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-[#082F2F] px-5 py-4 text-white sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BD9872]">
              Ajdal Paint Studio
            </p>

            <h2 className="mt-1 text-xl font-semibold uppercase sm:text-2xl">
              {service}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="flex h-11 w-11 items-center justify-center border border-white/20 transition hover:bg-white hover:text-[#0F4545]"
            aria-label="Close AR paint studio"
          >
            <X size={22} />
          </button>
        </div>

        {/* Main */}
        <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[1fr_340px]">

          {/* Camera */}
          <div className="relative min-h-[55vh] bg-black lg:min-h-0">

            {captured ? (
              <img
                src={captured}
                alt="Captured AR paint preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                />

                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              </>
            )}

            {/* Status */}
            <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] bg-[#082F2F]/90 px-4 py-3 text-xs font-medium text-white backdrop-blur-sm">
              {cameraError ||
                modelStatus}
            </div>

            {/* Camera Button */}
            {!captured && (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3">
                <button
                  type="button"
                  onClick={capture}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#BD9872] text-[#0F4545] shadow-xl transition hover:scale-105"
                  aria-label="Take photo"
                >
                  <Camera size={25} />
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <aside className="bg-[#F5F0EA] p-5 sm:p-7">

            {/* Finish */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD9872]">
                Choose Your Finish
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(
                  [
                    "Gloss",
                    "Metallic",
                    "Matte",
                  ] as Finish[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFinish(item)
                    }
                    className={`min-h-11 border px-2 text-xs font-semibold uppercase transition ${
                      finish === item
                        ? "border-[#0F4545] bg-[#0F4545] text-white"
                        : "border-neutral-300 bg-white text-[#0F4545] hover:border-[#BD9872]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD9872]">
                Paint Color
              </p>

              <div className="mt-4 grid grid-cols-4 gap-4">
                {colors.map(
                  (item) => (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() =>
                        setColor(
                          item.value
                        )
                      }
                      title={
                        item.name
                      }
                      aria-label={
                        item.name
                      }
                      className={`relative h-12 w-12 rounded-full border-2 transition ${
                        color ===
                        item.value
                          ? "border-[#0F4545] ring-2 ring-[#BD9872] ring-offset-2"
                          : "border-black/10"
                      }`}
                      style={{
                        backgroundColor:
                          item.value,
                      }}
                    >
                      {color ===
                        item.value && (
                        <Check
                          size={17}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow"
                        />
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Custom Color */}
              <label className="mt-5 block text-xs font-bold uppercase tracking-[0.15em] text-[#0F4545]">
                Custom Color

                <input
                  type="color"
                  value={color}
                  onChange={(event) =>
                    setColor(
                      event.target
                        .value
                    )
                  }
                  className="mt-2 h-12 w-full cursor-pointer border border-neutral-300 bg-white p-1"
                />
              </label>
            </div>

            {/* Back Camera */}
            {captured && (
              <button
                type="button"
                onClick={() => {
                  setCaptured(null);

                  setModelStatus(
                    "Point your camera at the vehicle"
                  );

                  runningRef.current =
                    true;

                  animationRef.current =
                    requestAnimationFrame(
                      processFrame
                    );
                }}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 border border-[#0F4545] px-4 text-sm font-semibold uppercase tracking-wide text-[#0F4545] transition hover:bg-[#0F4545] hover:text-white"
              >
                <RotateCcw size={17} />
                Back to Camera
              </button>
            )}

            {/* Request */}
            <button
              type="button"
              onClick={
                requestColor
              }
              className="mt-3 flex min-h-14 w-full items-center justify-center bg-[#BD9872] px-5 text-sm font-bold uppercase tracking-wide text-[#0F4545] transition hover:bg-[#0F4545] hover:text-white"
            >
              Request This Color
            </button>

            <p className="mt-4 text-xs leading-5 text-neutral-500">
              AR preview is an
              estimate. Final
              color and finish
              can vary depending
              on lighting,
              vehicle material
              and the selected
              paint system.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MASK HANDLING
   ========================================================= */

function normalizeMask(
  data: ArrayLike<number>,
  width: number,
  height: number
): Uint8Array {
  const pixels =
    width * height;

  const result =
    new Uint8Array(pixels);

  if (
    !width ||
    !height ||
    data.length === 0
  ) {
    return result;
  }

  /*
   * Transformers.js RawImage can expose
   * different channel layouts.
   *
   * Detect whether this is:
   *
   * 1 channel:
   * [a,a,a,a,...]
   *
   * or 4 channel:
   * [r,g,b,a,r,g,b,a,...]
   */
  const channels =
    Math.round(
      data.length / pixels
    );

  if (channels === 1) {
    for (
      let i = 0;
      i < pixels;
      i++
    ) {
      result[i] =
        clampByte(
          Number(data[i])
        );
    }

    return result;
  }

  /*
   * If 4-channel, use alpha.
   */
  if (channels >= 4) {
    for (
      let i = 0;
      i < pixels;
      i++
    ) {
      const alpha =
        Number(
          data[i * channels + 3]
        );

      const red =
        Number(
          data[i * channels]
        );

      /*
       * Some segmentation masks
       * may be stored as grayscale
       * RGB with no useful alpha.
       */
      result[i] =
        alpha > 0
          ? clampByte(alpha)
          : clampByte(red);
    }

    return result;
  }

  /*
   * Fallback.
   */
  for (
    let i = 0;
    i < pixels;
    i++
  ) {
    result[i] =
      clampByte(
        Number(
          data[
            Math.min(
              data.length - 1,
              i
            )
          ]
        )
      );
  }

  return result;
}

/* =========================================================
   LARGEST CONNECTED VEHICLE
   ========================================================= */

function largestComponent(
  data: Uint8Array,
  width: number,
  height: number,
  threshold: number
): Uint8Array | null {
  if (
    width <= 0 ||
    height <= 0 ||
    data.length <
      width * height
  ) {
    return null;
  }

  const visited =
    new Uint8Array(
      width * height
    );

  let best:
    | number[]
    | null = null;

  /*
   * We don't want thousands of tiny
   * disconnected components.
   */
  for (
    let start = 0;
    start <
    width * height;
    start++
  ) {
    if (
      visited[start] ||
      data[start] <
        threshold
    ) {
      continue;
    }

    const queue: number[] = [
      start,
    ];

    const component: number[] =
      [];

    visited[start] = 1;

    for (
      let q = 0;
      q < queue.length;
      q++
    ) {
      const index =
        queue[q];

      component.push(index);

      const x =
        index % width;

      const y =
        Math.floor(
          index / width
        );

      const neighbors = [
        index - 1,
        index + 1,
        index - width,
        index + width,
      ];

      if (x === 0) {
        neighbors[0] = -1;
      }

      if (x === width - 1) {
        neighbors[1] = -1;
      }

      if (y === 0) {
        neighbors[2] = -1;
      }

      if (y === height - 1) {
        neighbors[3] = -1;
      }

      for (
        const next of neighbors
      ) {
        if (
          next >= 0 &&
          next <
            width * height &&
          !visited[next] &&
          data[next] >=
            threshold
        ) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }

    if (
      !best ||
      component.length >
        best.length
    ) {
      best = component;
    }
  }

  if (
    !best ||
    !best.length
  ) {
    return null;
  }

  const mask =
    new Uint8Array(
      width * height
    );

  for (
    const index of best
  ) {
    mask[index] =
      data[index];
  }

  return mask;
}

/* =========================================================
   COLOR HELPERS
   ========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function clampByte(
  value: number
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(
    clamp(
      value,
      0,
      255
    )
  );
}

function hexToRgb(
  hex: string
) {
  const clean =
    hex.replace(
      "#",
      ""
    );

  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map(
            (item) =>
              item + item
          )
          .join("")
      : clean;

  const value =
    Number.parseInt(
      normalized,
      16
    );

  if (
    !Number.isFinite(value)
  ) {
    return {
      r: 17,
      g: 17,
      b: 17,
    };
  }

  return {
    r:
      (value >> 16) &
      255,

    g:
      (value >> 8) &
      255,

    b:
      value & 255,
  };
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max =
    Math.max(r, g, b);

  const min =
    Math.min(r, g, b);

  let h = 0;
  let s = 0;

  const l =
    (max + min) / 2;

  const d =
    max - min;

  if (d !== 0) {
    s =
      l > 0.5
        ? d /
          (2 -
            max -
            min)
        : d /
          (max +
            min);

    switch (max) {
      case r:
        h =
          (g - b) /
            d +
          (g < b ? 6 : 0);
        break;

      case g:
        h =
          (b - r) /
            d +
          2;
        break;

      default:
        h =
          (r - g) /
            d +
          4;
        break;
    }

    h /= 6;
  }

  return {
    h,
    s,
    l,
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number
) {
  if (s === 0) {
    const value =
      Math.round(
        l * 255
      );

    return {
      r: value,
      g: value,
      b: value,
    };
  }

  const hue2rgb = (
    p: number,
    q: number,
    t: number
  ) => {
    if (t < 0) {
      t += 1;
    }

    if (t > 1) {
      t -= 1;
    }

    if (
      t <
      1 / 6
    ) {
      return (
        p +
        (q - p) *
          6 *
          t
      );
    }

    if (
      t <
      1 / 2
    ) {
      return q;
    }

    if (
      t <
      2 / 3
    ) {
      return (
        p +
        (q - p) *
          (2 / 3 -
            t) *
          6
      );
    }

    return p;
  };

  const q =
    l < 0.5
      ? l *
        (1 + s)
      : l +
        s -
        l * s;

  const p =
    2 * l - q;

  return {
    r: Math.round(
      hue2rgb(
        p,
        q,
        h + 1 / 3
      ) * 255
    ),

    g: Math.round(
      hue2rgb(
        p,
        q,
        h
      ) * 255
    ),

    b: Math.round(
      hue2rgb(
        p,
        q,
        h - 1 / 3
      ) * 255
    ),
  };
}