"use client";

import {
  Camera,
  Check,
  RotateCcw,
  Scan,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Finish = "Gloss" | "Metallic" | "Matte";

type Props = {
  service:
    | "Custom Full Vehicle Painting"
    | "Peelable Paint Solutions";
  open: boolean;
  onClose: () => void;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

const colors = [
  {
    name: "Obsidian Black",
    value: "#101112",
  },
  {
    name: "Pearl White",
    value: "#f4f3ee",
  },
  {
    name: "Platinum Silver",
    value: "#a9adb1",
  },
  {
    name: "Deep Red",
    value: "#8b1018",
  },
  {
    name: "Racing Blue",
    value: "#123e70",
  },
  {
    name: "British Green",
    value: "#173f2c",
  },
  {
    name: "Champagne",
    value: "#bca789",
  },
  {
    name: "Nardo Grey",
    value: "#777b7d",
  },
];

export default function ArPaintVisualizer({
  service,
  open,
  onClose,
}: Props) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const maskCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const modelRef =
    useRef<any>(null);

  const maskRef =
    useRef<Uint8Array | null>(null);

  const maskWidthRef =
    useRef(0);

  const maskHeightRef =
    useRef(0);

  const processingRef =
    useRef(false);

  const animationRef =
    useRef<number | null>(null);

  const [color, setColor] =
    useState("#8b1018");

  const [finish, setFinish] =
    useState<Finish>("Gloss");

  const [status, setStatus] =
    useState("Opening camera…");

  const [error, setError] =
    useState("");

  const [modelReady, setModelReady] =
    useState(false);

  const [vehicleDetected, setVehicleDetected] =
    useState(false);

  const [captured, setCaptured] =
    useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * STOP EVERYTHING
   * ---------------------------------------------------------
   */

  const stopCamera = () => {
    if (
      animationRef.current !== null
    ) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    processingRef.current =
      false;
  };

  /*
   * ---------------------------------------------------------
   * START CAMERA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!open) {
      stopCamera();

      maskRef.current = null;

      setCaptured(null);
      setVehicleDetected(false);
      setModelReady(false);

      return;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        setError("");
        setStatus(
          "Opening camera…"
        );

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "Camera is not supported."
          );
        }

        /*
         * Rear camera
         */
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                facingMode: {
                  ideal:
                    "environment",
                },
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              },
              audio: false,
            }
          );

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        streamRef.current =
          stream;

        const video =
          videoRef.current;

        if (!video) {
          throw new Error(
            "Camera element unavailable."
          );
        }

        video.srcObject =
          stream;

        video.muted = true;

        video.setAttribute(
          "playsinline",
          "true"
        );

        await video.play();

        setStatus(
          "Loading vehicle detection…"
        );

        /*
         * Load Transformers.js only
         * in the browser.
         */
        const dynamicImport =
          new Function(
            "url",
            "return import(url)"
          ) as (
            url: string
          ) => Promise<any>;

        const transformers =
          await dynamicImport(
            "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm"
          );

        if (cancelled) {
          return;
        }

        /*
         * Browser cache enabled.
         */
        if (
          transformers.env
        ) {
          transformers.env.allowLocalModels =
            false;

          transformers.env.useBrowserCache =
            true;

          if (
            transformers.env
              .backends?.onnx?.wasm
          ) {
            transformers.env.backends.onnx.wasm.numThreads =
              1;
          }
        }

        /*
         * Lightweight Cityscapes
         * SegFormer.
         *
         * The model has a dedicated
         * "car" class.
         */
        modelRef.current =
          await transformers.pipeline(
            "image-segmentation",
            "Xenova/segformer-b0-finetuned-cityscapes-512-1024",
            {
              device: "wasm",
            }
          );

        if (cancelled) {
          return;
        }

        setModelReady(true);

        setStatus(
          "Ready — point at the car and scan"
        );
      } catch (err) {
        console.error(
          "AR startup error:",
          err
        );

        setError(
          "Camera or vehicle detection could not start. Please allow camera access and try Safari or Chrome."
        );

        setStatus(
          "Camera unavailable"
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;

      stopCamera();
    };
  }, [open]);

  /*
   * ---------------------------------------------------------
   * SCAN CAR
   *
   * AI runs ONLY here.
   * Not continuously.
   * ---------------------------------------------------------
   */

  const scanCar = async () => {
    if (
      processingRef.current ||
      !modelRef.current ||
      !videoRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (
      video.readyState < 2
    ) {
      return;
    }

    processingRef.current =
      true;

    setStatus(
      "Scanning vehicle…"
    );

    setError("");

    try {
      /*
       * Keep AI input small.
       * This is important for iPhone.
       */
      const input =
        document.createElement(
          "canvas"
        );

      const maxWidth = 512;

      const scale =
        Math.min(
          1,
          maxWidth /
            video.videoWidth
        );

      input.width =
        Math.max(
          1,
          Math.round(
            video.videoWidth *
              scale
          )
        );

      input.height =
        Math.max(
          1,
          Math.round(
            video.videoHeight *
              scale
          )
        );

      const ctx =
        input.getContext("2d", {
          willReadFrequently: true,
        });

      if (!ctx) {
        throw new Error(
          "Canvas unavailable."
        );
      }

      ctx.drawImage(
        video,
        0,
        0,
        input.width,
        input.height
      );

      /*
       * Run AI ONCE.
       */
      const result =
        await modelRef.current(
          input
        );

      /*
       * Find car class.
       */
      const car =
        result?.find(
          (item: any) => {
            const label =
              String(
                item?.label ??
                  ""
              ).toLowerCase();

            return (
              label === "car"
            );
          }
        );

      if (
        !car ||
        !car.mask
      ) {
        setVehicleDetected(
          false
        );

        setStatus(
          "No car detected — move closer and scan again"
        );

        return;
      }

      const rawData =
        car.mask.data;

      const maskWidth =
        Number(
          car.mask.width
        ) ||
        input.width;

      const maskHeight =
        Number(
          car.mask.height
        ) ||
        input.height;

      if (!rawData) {
        throw new Error(
          "Vehicle mask unavailable."
        );
      }

      /*
       * Convert mask.
       */
      const normalized =
        normalizeMask(
          rawData,
          maskWidth,
          maskHeight
        );

      /*
       * Keep largest connected
       * vehicle.
       */
      const largest =
        largestComponent(
          normalized,
          maskWidth,
          maskHeight,
          80
        );

      if (!largest) {
        setVehicleDetected(
          false
        );

        setStatus(
          "Car not detected clearly — scan again"
        );

        return;
      }

      /*
       * Save mask.
       */
      maskRef.current =
        largest;

      maskWidthRef.current =
        maskWidth;

      maskHeightRef.current =
        maskHeight;

      /*
       * Create mask canvas.
       */
      const maskCanvas =
        maskCanvasRef.current;

      if (maskCanvas) {
        maskCanvas.width =
          maskWidth;

        maskCanvas.height =
          maskHeight;

        const maskContext =
          maskCanvas.getContext(
            "2d"
          );

        if (maskContext) {
          const image =
            maskContext.createImageData(
              maskWidth,
              maskHeight
            );

          for (
            let i = 0;
            i <
            largest.length;
            i++
          ) {
            const value =
              largest[i];

            const index =
              i * 4;

            image.data[
              index
            ] = 255;

            image.data[
              index + 1
            ] = 255;

            image.data[
              index + 2
            ] = 255;

            image.data[
              index + 3
            ] = value;
          }

          maskContext.putImageData(
            image,
            0,
            0
          );
        }
      }

      setVehicleDetected(
        true
      );

      setStatus(
        "Vehicle detected • choose your color"
      );

      /*
       * Start cheap live rendering.
       * NO MORE AI.
       */
      startRendering();
    } catch (err) {
      console.error(
        "Vehicle scan error:",
        err
      );

      setVehicleDetected(
        false
      );

      setStatus(
        "Scan failed — please try again"
      );
    } finally {
      processingRef.current =
        false;
    }
  };

  /*
   * ---------------------------------------------------------
   * LIVE COLOR RENDERING
   *
   * This part does NOT use AI.
   * ---------------------------------------------------------
   */

  const startRendering = () => {
    if (
      animationRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    const render = () => {
      renderPaint();

      animationRef.current =
        requestAnimationFrame(
          render
        );
    };

    render();
  };

  const renderPaint = () => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const mask =
      maskRef.current;

    if (
      !video ||
      !canvas ||
      !mask
    ) {
      return;
    }

    if (
      video.readyState < 2
    ) {
      return;
    }

    /*
     * Render at reduced resolution.
     *
     * This is MUCH cheaper on iPhone
     * than processing 1280x720.
     */
    const renderWidth = 640;

    const ratio =
      video.videoHeight /
      video.videoWidth;

    const renderHeight =
      Math.round(
        renderWidth * ratio
      );

    canvas.width =
      renderWidth;

    canvas.height =
      renderHeight;

    const context =
      canvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    /*
     * Draw original camera.
     */
    context.drawImage(
      video,
      0,
      0,
      renderWidth,
      renderHeight
    );

    const frame =
      context.getImageData(
        0,
        0,
        renderWidth,
        renderHeight
      );

    const output =
      new ImageData(
        new Uint8ClampedArray(
          frame.data
        ),
        renderWidth,
        renderHeight
      );

    const maskWidth =
      maskWidthRef.current;

    const maskHeight =
      maskHeightRef.current;

    const paint =
      hexToRgb(color);

    const targetHsl =
      rgbToHsl(
        paint.r,
        paint.g,
        paint.b
      );

    for (
      let y = 0;
      y < renderHeight;
      y++
    ) {
      for (
        let x = 0;
        x < renderWidth;
        x++
      ) {
        const index =
          (y *
            renderWidth +
            x) *
          4;

        /*
         * Find matching mask pixel.
         */
        const mx =
          Math.min(
            maskWidth - 1,
            Math.max(
              0,
              Math.round(
                (x /
                  renderWidth) *
                  (maskWidth -
                    1)
              )
            )
          );

        const my =
          Math.min(
            maskHeight - 1,
            Math.max(
              0,
              Math.round(
                (y /
                  renderHeight) *
                  (maskHeight -
                    1)
              )
            )
          );

        const maskIndex =
          my *
            maskWidth +
          mx;

        const maskAlpha =
          mask[maskIndex];

        if (
          maskAlpha <
          40
        ) {
          continue;
        }

        const r =
          frame.data[index];

        const g =
          frame.data[
            index + 1
          ];

        const b =
          frame.data[
            index + 2
          ];

        const originalHsl =
          rgbToHsl(
            r,
            g,
            b
          );

        /*
         * Protect very dark details:
         * tires, vents, grilles,
         * gaps and some glass.
         */
        const dark =
          clamp(
            (0.14 -
              originalHsl.l) /
              0.14,
            0,
            1
          );

        /*
         * Keep original lighting.
         */
        let saturation =
          targetHsl.s;

        if (
          finish ===
          "Matte"
        ) {
          saturation *=
            0.68;
        }

        if (
          finish ===
          "Metallic"
        ) {
          saturation *=
            0.9;
        }

        /*
         * Paint strength.
         */
        let strength =
          (maskAlpha /
            255) *
          (1 -
            dark *
              0.9);

        /*
         * Slightly stronger
         * than the previous version.
         */
        if (
          finish ===
          "Gloss"
        ) {
          strength *=
            0.72;
        }

        if (
          finish ===
          "Metallic"
        ) {
          strength *=
            0.68;
        }

        if (
          finish ===
          "Matte"
        ) {
          strength *=
            0.62;
        }

        strength =
          clamp(
            strength,
            0,
            0.82
          );

        if (
          strength <
          0.02
        ) {
          continue;
        }

        /*
         * Preserve original
         * lightness/reflections.
         */
        const recolored =
          hslToRgb(
            targetHsl.h,
            clamp(
              saturation,
              0,
              1
            ),
            clamp(
              originalHsl.l,
              0.07,
              0.93
            )
          );

        output.data[
          index
        ] =
          r *
            (1 -
              strength) +
          recolored.r *
            strength;

        output.data[
          index + 1
        ] =
          g *
            (1 -
              strength) +
          recolored.g *
            strength;

        output.data[
          index + 2
        ] =
          b *
            (1 -
              strength) +
          recolored.b *
            strength;

        output.data[
          index + 3
        ] = 255;
      }
    }

    context.putImageData(
      output,
      0,
      0
    );
  };

  /*
   * ---------------------------------------------------------
   * COLOR CHANGE
   *
   * Re-render immediately.
   * No AI.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      vehicleDetected
    ) {
      renderPaint();
    }
  }, [
    color,
    finish,
    vehicleDetected,
  ]);

  /*
   * ---------------------------------------------------------
   * CAPTURE
   * ---------------------------------------------------------
   */

  const capture = () => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (
      !video ||
      !canvas
    ) {
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
      photo.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    /*
     * Use the current rendered
     * preview.
     */
    context.drawImage(
      canvas,
      0,
      0,
      photo.width,
      photo.height
    );

    setCaptured(
      photo.toDataURL(
        "image/jpeg",
        0.9
      )
    );
  };

  /*
   * ---------------------------------------------------------
   * REQUEST COLOR
   * ---------------------------------------------------------
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

  /*
   * ---------------------------------------------------------
   * CLOSE
   * ---------------------------------------------------------
   */

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
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[1fr_340px]">

          {/* Camera */}
          <div className="relative min-h-[55vh] bg-black lg:min-h-0">

            {captured ? (
              <img
                src={captured}
                alt="AR paint preview"
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
            <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] bg-[#082F2F]/90 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm">

              {error ||
                status}

            </div>

            {/* Scan Button */}
            {!captured &&
              modelReady && (
                <button
                  type="button"
                  onClick={scanCar}
                  disabled={
                    processingRef.current
                  }
                  className="absolute bottom-5 left-1/2 flex min-h-14 -translate-x-1/2 items-center gap-2 bg-[#BD9872] px-6 font-bold uppercase tracking-wide text-[#0F4545] shadow-xl transition hover:bg-white disabled:opacity-60"
                >
                  <Scan size={20} />

                  {vehicleDetected
                    ? "Scan Again"
                    : "Scan Car"}
                </button>
              )}
          </div>

          {/* Controls */}
          <aside className="bg-[#F5F0EA] p-5 sm:p-7">

            {/* Finish */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD9872]">
                Choose your finish
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2">

                {(
                  [
                    "Gloss",
                    "Metallic",
                    "Matte",
                  ] as Finish[]
                ).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFinish(
                          item
                        )
                      }
                      className={`min-h-11 border px-2 text-xs font-semibold uppercase transition ${
                        finish ===
                        item
                          ? "border-[#0F4545] bg-[#0F4545] text-white"
                          : "border-neutral-300 bg-white text-[#0F4545] hover:border-[#BD9872]"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              </div>
            </div>

            {/* Colors */}
            <div className="mt-7">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD9872]">
                Paint color
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

              {/* Custom color */}
              <label className="mt-5 block text-xs font-bold uppercase tracking-[0.15em] text-[#0F4545]">

                Custom color

                <input
                  type="color"
                  value={color}
                  onChange={(
                    event
                  ) =>
                    setColor(
                      event.target
                        .value
                    )
                  }
                  className="mt-2 h-12 w-full cursor-pointer border border-neutral-300 bg-white p-1"
                />

              </label>
            </div>

            {/* Camera instructions */}
            {!vehicleDetected &&
              modelReady && (
                <div className="mt-7 border border-[#BD9872]/40 bg-white p-4">

                  <p className="text-sm font-semibold text-[#0F4545]">
                    How to use
                  </p>

                  <ol className="mt-2 space-y-2 text-xs leading-5 text-neutral-600">
                    <li>
                      1. Point the camera at
                      the entire car.
                    </li>

                    <li>
                      2. Tap{" "}
                      <strong>
                        Scan Car
                      </strong>
                      .
                    </li>

                    <li>
                      3. Choose a paint
                      color.
                    </li>

                    <li>
                      4. Change the finish
                      instantly.
                    </li>
                  </ol>

                </div>
              )}

            {/* Capture */}
            {captured && (
              <button
                type="button"
                onClick={() => {
                  setCaptured(
                    null
                  );

                  startRendering();
                }}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 border border-[#0F4545] px-4 text-sm font-semibold uppercase tracking-wide text-[#0F4545] transition hover:bg-[#0F4545] hover:text-white"
              >
                <RotateCcw
                  size={17}
                />

                Back to Camera
              </button>
            )}

            {/* Take photo */}
            {!captured &&
              vehicleDetected && (
                <button
                  type="button"
                  onClick={capture}
                  className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 border border-[#0F4545] bg-white px-4 text-sm font-semibold uppercase tracking-wide text-[#0F4545] transition hover:bg-[#0F4545] hover:text-white"
                >
                  <Camera
                    size={18}
                  />

                  Take Photo
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
              AR preview is an estimate.
              Final color can vary depending
              on lighting, vehicle material
              and the selected paint system.
            </p>

          </aside>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MASK
   ========================================================= */

function normalizeMask(
  data: ArrayLike<number>,
  width: number,
  height: number
) {
  const pixels =
    width * height;

  const output =
    new Uint8Array(
      pixels
    );

  const channels =
    Math.round(
      data.length /
        pixels
    );

  if (
    channels === 1
  ) {
    for (
      let i = 0;
      i < pixels;
      i++
    ) {
      output[i] =
        clampByte(
          Number(
            data[i]
          )
        );
    }

    return output;
  }

  /*
   * RawImage may have
   * RGB/RGBA channels.
   */
  if (
    channels >= 4
  ) {
    for (
      let i = 0;
      i < pixels;
      i++
    ) {
      const alpha =
        Number(
          data[
            i *
              channels +
              3
          ]
        );

      const red =
        Number(
          data[
            i *
              channels
          ]
        );

      output[i] =
        clampByte(
          alpha > 0
            ? alpha
            : red
        );
    }

    return output;
  }

  for (
    let i = 0;
    i < pixels;
    i++
  ) {
    output[i] =
      clampByte(
        Number(
          data[
            Math.min(
              data.length -
                1,
              i
            )
          ]
        )
      );
  }

  return output;
}

/* =========================================================
   LARGEST CAR
   ========================================================= */

function largestComponent(
  data: Uint8Array,
  width: number,
  height: number,
  threshold: number
) {
  const total =
    width * height;

  const visited =
    new Uint8Array(
      total
    );

  let best: number[] =
    [];

  for (
    let start = 0;
    start < total;
    start++
  ) {
    if (
      visited[start] ||
      data[start] <
        threshold
    ) {
      continue;
    }

    const queue =
      [start];

    const component:
      number[] =
      [];

    visited[start] =
      1;

    for (
      let q = 0;
      q <
      queue.length;
      q++
    ) {
      const index =
        queue[q];

      component.push(
        index
      );

      const x =
        index % width;

      const y =
        Math.floor(
          index /
            width
        );

      const left =
        x > 0
          ? index - 1
          : -1;

      const right =
        x <
        width - 1
          ? index + 1
          : -1;

      const up =
        y > 0
          ? index -
            width
          : -1;

      const down =
        y <
        height - 1
          ? index +
            width
          : -1;

      const neighbors =
        [
          left,
          right,
          up,
          down,
        ];

      for (
        const next of
          neighbors
      ) {
        if (
          next >= 0 &&
          next <
            total &&
          !visited[next] &&
          data[next] >=
            threshold
        ) {
          visited[next] =
            1;

          queue.push(
            next
          );
        }
      }
    }

    if (
      component.length >
      best.length
    ) {
      best =
        component;
    }
  }

  if (
    best.length === 0
  ) {
    return null;
  }

  const result =
    new Uint8Array(
      total
    );

  for (
    const index of
      best
  ) {
    result[index] =
      data[index];
  }

  return result;
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
    Math.max(
      min,
      value
    )
  );
}

function clampByte(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
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
): RGB {
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
            (x) =>
              x + x
          )
          .join("")
      : clean;

  const value =
    Number.parseInt(
      normalized,
      16
    );

  if (
    !Number.isFinite(
      value
    )
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
    Math.max(
      r,
      g,
      b
    );

  const min =
    Math.min(
      r,
      g,
      b
    );

  let h = 0;
  let s = 0;

  const l =
    (max + min) /
    2;

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
          (g < b
            ? 6
            : 0);
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
): RGB {
  if (
    s === 0
  ) {
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
    if (t < 0)
      t += 1;

    if (t > 1)
      t -= 1;

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