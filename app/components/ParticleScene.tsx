'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const N = 8000;
const LERP = 0.07; // exponential decay — no overshoot, pure smooth glide
const COLOR_SCALE = 0.75; // dim colors so additive blending doesn't blow out

const vertexShader = `
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_PointSize = 2.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a);
  }
`;

type RawPt = { x: number; y: number; r: number; g: number; b: number };

function sampleOffscreen(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w: number,
  h: number,
  ox: number,
  oy: number,
  W: number,
  H: number,
  count: number
): RawPt[] {
  const iw = Math.round(w);
  const ih = Math.round(h);
  const c = document.createElement('canvas');
  c.width = iw;
  c.height = ih;
  const ctx = c.getContext('2d')!;
  draw(ctx, iw, ih);
  const { data } = ctx.getImageData(0, 0, iw, ih);
  const pts: RawPt[] = [];

  for (let y = 0; y < ih; y += 2) {
    for (let x = 0; x < iw; x += 2) {
      const i = (y * iw + x) * 4;
      if (data[i + 3] > 50) {
        // Convert canvas coords → Three.js world coords (centered, Y-flipped)
        pts.push({
          x: ox + x - W / 2,
          y: H / 2 - (oy + y),
          r: (data[i] / 255) * COLOR_SCALE,
          g: (data[i + 1] / 255) * COLOR_SCALE,
          b: (data[i + 2] / 255) * COLOR_SCALE,
        });
      }
    }
  }

  // Fisher-Yates shuffle then take first `count`
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts.slice(0, count);
}

// Formation builders
// Placeholder portrait
function buildPortrait(W: number, H: number): RawPt[] {
  const s = Math.min(W, H) * 0.62;
  const ox = (W - s) / 2;
  const oy = (H - s) / 2;
  return sampleOffscreen(
    (ctx) => {
      // Head
      ctx.fillStyle = '#ddc9a8';
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.38, s * 0.19, s * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      // Neck
      ctx.fillRect(s * 0.44, s * 0.60, s * 0.12, s * 0.09);
      // Shoulders (bottom half of ellipse)
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.76, s * 0.28, s * 0.14, 0, 0, Math.PI);
      ctx.fill();
      // Hair
      ctx.fillStyle = '#1a0d00';
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.21, s * 0.20, s * 0.13, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#2a1500';
      for (const ex of [0.43, 0.57]) {
        ctx.beginPath();
        ctx.ellipse(s * ex, s * 0.34, s * 0.026, s * 0.018, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Mouth
      ctx.fillStyle = '#8a3a2a';
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.476, s * 0.058, 0.15, Math.PI - 0.15);
      ctx.fill();
    },
    s, s, ox, oy, W, H, N
  );
}

// Code-editor window — represents a project
function buildProject(W: number, H: number): RawPt[] {
  const pw = Math.min(W, H) * 0.58;
  const ph = pw * 0.63;
  const ox = (W - pw) / 2;
  const oy = (H - ph) / 2;
  return sampleOffscreen(
    (ctx) => {
      // Window frame
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(5, 5, pw - 10, ph - 10, 10);
      ctx.stroke();
      // Title bar
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.roundRect(5, 5, pw - 10, 28, [10, 10, 0, 0]);
      ctx.fill();
      // Traffic dots
      for (const [clr, xi] of [['#ff5f56', 0], ['#febc2e', 1], ['#28c840', 2]] as const) {
        ctx.fillStyle = clr;
        ctx.beginPath();
        ctx.arc(20 + (xi as number) * 18, 19, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Simulated code lines
      const lines: [number, number, number, string][] = [
        [16, 46,  pw * 0.16, '#c084fc'],
        [16 + pw * 0.16 + 6, 46, pw * 0.10, '#818cf8'],
        [16, 62,  pw * 0.45, '#818cf8'],
        [16, 78,  pw * 0.09, '#34d399'],
        [16 + pw * 0.09 + 6, 78, pw * 0.28, '#818cf8'],
        [16, 94,  pw * 0.52, '#818cf8'],
        [16, 110, pw * 0.33, '#818cf8'],
        [16, 130, pw * 0.14, '#c084fc'],
        [16 + pw * 0.14 + 6, 130, pw * 0.08, '#818cf8'],
        [16, 146, pw * 0.48, '#818cf8'],
        [16, 162, pw * 0.36, '#818cf8'],
      ];
      for (const [x, y, lw, clr] of lines) {
        ctx.fillStyle = clr;
        ctx.fillRect(x, y, lw, 7);
      }
    },
    pw, ph, ox, oy, W, H, N
  );
}

// Inner particle component (lives inside <Canvas>)
interface ParticleSystemProps {
  scrollTRef: React.MutableRefObject<number>;
}

function ParticleSystem({ scrollTRef }: ParticleSystemProps) {
  const { size } = useThree();
  const pointsRef = useRef<THREE.Points>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const dataRef = useRef({
    positions: new Float32Array(0),
    targetA: new Float32Array(0),
    targetB: new Float32Array(0),
    chaos: new Float32Array(0),
    colorsA: new Float32Array(0),
    colorsB: new Float32Array(0),
    colors: new Float32Array(0),
    count: 0,
  });

  // Rebuild formations whenever canvas dimensions change
  useEffect(() => {
    const W = size.width;
    const H = size.height;
    if (!W || !H) return;

    const a = buildPortrait(W, H);
    const b = buildProject(W, H);
    const count = Math.min(a.length, b.length, N);

    const positions = new Float32Array(count * 3);
    const targetA = new Float32Array(count * 3);
    const targetB = new Float32Array(count * 3);
    const chaos = new Float32Array(count * 3);
    const colorsA = new Float32Array(count * 3);
    const colorsB = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random scatter for initial positions
      positions[i3]     = (Math.random() - 0.5) * W;
      positions[i3 + 1] = (Math.random() - 0.5) * H;
      positions[i3 + 2] = 0;

      targetA[i3]     = a[i].x;
      targetA[i3 + 1] = a[i].y;

      targetB[i3]     = b[i].x;
      targetB[i3 + 1] = b[i].y;

      chaos[i3]     = (Math.random() - 0.5) * W * 0.85;
      chaos[i3 + 1] = (Math.random() - 0.5) * H * 0.85;

      colorsA[i3] = a[i].r; colorsA[i3 + 1] = a[i].g; colorsA[i3 + 2] = a[i].b;
      colorsB[i3] = b[i].r; colorsB[i3 + 1] = b[i].g; colorsB[i3 + 2] = b[i].b;
      colors[i3]  = a[i].r; colors[i3 + 1]  = a[i].g; colors[i3 + 2]  = a[i].b;
    }

    dataRef.current = { positions, targetA, targetB, chaos, colorsA, colorsB, colors, count };

    const pts = pointsRef.current;
    if (pts) {
      pts.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pts.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    }
  }, [size.width, size.height]);

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;
    const d = dataRef.current;
    if (!d.count) return;

    const t = scrollTRef.current;
    const { positions, velocities, targetA, targetB, chaos, colorsA, colorsB, colors, count } = d;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let tx: number, ty: number, cr: number, cg: number, cb: number;

      // Scroll phases:
      // 0.00–0.30 → hold portrait
      // 0.30–0.50 → scatter (chaos)
      // 0.50–0.70 → converge into project
      // 0.70–1.00 → hold project
      if (t < 0.3) {
        tx = targetA[i3];     ty = targetA[i3 + 1];
        cr = colorsA[i3]; cg = colorsA[i3 + 1]; cb = colorsA[i3 + 2];
      } else if (t < 0.5) {
        const f = (t - 0.3) / 0.2;
        tx = targetA[i3]     + chaos[i3]     * f;
        ty = targetA[i3 + 1] + chaos[i3 + 1] * f;
        cr = colorsA[i3]; cg = colorsA[i3 + 1]; cb = colorsA[i3 + 2];
      } else if (t < 0.7) {
        const f = (t - 0.5) / 0.2;
        tx = targetB[i3]     * f + (targetA[i3]     + chaos[i3])     * (1 - f);
        ty = targetB[i3 + 1] * f + (targetA[i3 + 1] + chaos[i3 + 1]) * (1 - f);
        cr = colorsA[i3]     + (colorsB[i3]     - colorsA[i3])     * f;
        cg = colorsA[i3 + 1] + (colorsB[i3 + 1] - colorsA[i3 + 1]) * f;
        cb = colorsA[i3 + 2] + (colorsB[i3 + 2] - colorsA[i3 + 2]) * f;
      } else {
        tx = targetB[i3];     ty = targetB[i3 + 1];
        cr = colorsB[i3]; cg = colorsB[i3 + 1]; cb = colorsB[i3 + 2];
      }

      positions[i3]     += (tx - positions[i3])     * LERP;
      positions[i3 + 1] += (ty - positions[i3 + 1]) * LERP;

      colors[i3] = cr; colors[i3 + 1] = cg; colors[i3 + 2] = cb;
    }

    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.aColor.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry />
    </points>
  );
}

// Public export — the full Canvas
export default function ParticleScene({
  scrollTRef,
}: {
  scrollTRef: React.MutableRefObject<number>;
}) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 1000 }}
      style={{ background: '#000000' }}
      gl={{ antialias: false, alpha: false }}
    >
      <ParticleSystem scrollTRef={scrollTRef} />
    </Canvas>
  );
}
