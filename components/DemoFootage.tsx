"use client";

import { useEffect, useRef } from "react";

// Stand-in night footage for the window until the barn camera exists:
// warm shapes circling *inside* the barn (they fly inside — docs/DESIGN.md
// §2), on the real night. Honest about itself via a small inked label.
// Freezes to a single frame when motion is off.
export default function DemoFootage({ paused = false }: { paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;
    const W = (cv.width = 960);
    const H = (cv.height = 540);

    // Pre-rendered warm "body heat" sprite.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const s = sprite.getContext("2d")!;
    const gr = s.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, "rgba(255,252,244,.95)");
    gr.addColorStop(0.3, "rgba(255,208,130,.8)");
    gr.addColorStop(0.65, "rgba(226,124,48,.3)");
    gr.addColorStop(1, "rgba(180,70,20,0)");
    s.fillStyle = gr;
    s.fillRect(0, 0, 64, 64);

    // Static grain.
    const grain = document.createElement("canvas");
    grain.width = 240;
    grain.height = 135;
    const g = grain.getContext("2d")!;
    const img = g.createImageData(240, 135);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 14;
    }
    g.putImageData(img, 0, 0);

    // Bats on looping interior orbits (they circle the roost).
    const bats = Array.from({ length: 5 }, (_, i) => ({
      cx: W * (0.3 + 0.4 * ((i * 0.618) % 1)),
      cy: H * (0.35 + 0.25 * ((i * 0.383) % 1)),
      rx: 90 + 70 * ((i * 0.734) % 1),
      ry: 40 + 45 * ((i * 0.517) % 1),
      speed: (0.00035 + 0.00025 * ((i * 0.271) % 1)) * (i % 2 ? 1 : -1),
      phase: i * 1.7,
      size: 0.55 + 0.5 * ((i * 0.911) % 1),
    }));

    let raf = 0;
    function frame(t: number) {
      if (!cx) return;
      // Night interior — near-black with the faintest structure.
      const sky = cx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0b0917");
      sky.addColorStop(1, "#161126");
      cx.fillStyle = sky;
      cx.fillRect(0, 0, W, H);
      // Rafter shadows.
      cx.strokeStyle = "rgba(244,240,255,.05)";
      cx.lineWidth = 14;
      for (const x of [0.18, 0.5, 0.82]) {
        cx.beginPath();
        cx.moveTo(W * x - 60, 0);
        cx.lineTo(W * x + 60, H * 0.35);
        cx.stroke();
      }
      cx.drawImage(grain, 0, 0, W, H);
      cx.globalCompositeOperation = "lighter";
      for (const b of bats) {
        const a = t * b.speed + b.phase;
        const x = b.cx + Math.cos(a) * b.rx;
        const y = b.cy + Math.sin(a) * b.ry + Math.sin(t / 90 + b.phase) * 5;
        const flap = 1 + 0.3 * Math.sin(t / 52 + b.phase);
        const sz = 30 * b.size;
        cx.drawImage(sprite, x - (sz * flap) / 2, y - sz / 2, sz * flap, sz * 0.8);
      }
      cx.globalCompositeOperation = "source-over";
      // Corner vignette so the cut edge reads deep.
      const v = cx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(5,4,12,.55)");
      cx.fillStyle = v;
      cx.fillRect(0, 0, W, H);
    }

    function loop(t: number) {
      const motionOn = document.documentElement.dataset.motion !== "off";
      if (motionOn && !pausedRef.current) frame(t);
      raf = requestAnimationFrame(loop);
    }
    frame(1200); // always paint one frame (motion-off case)
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-label="Night view inside the bat barn: warm shapes circling the roost (demo footage until the barn camera is connected)"
    />
  );
}
