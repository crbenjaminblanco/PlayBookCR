import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useAppTheme } from '@/src/theme/ThemeProvider';

const COUNT = 72;

function dot(index: number, time: number) {
  const slice = Math.floor(index / 8);
  const ring = index % 8;
  const theta = (slice / 8) * Math.PI;
  const taper = Math.sin(theta);
  const spin = time * 0.01;
  const phi = (ring / 8) * Math.PI * 2 + spin + slice * 0.35;
  const wander = index % 11 === 0 ? 1 + Math.sin(time * 0.02 + index) * 0.18 : 1;
  const x = Math.cos(phi) * taper * 0.46 * wander;
  const y = (theta / Math.PI - 0.5) * 1.15;
  const z = Math.sin(phi) * taper * 0.34 * wander;
  const turn = time * 0.008;
  const x2 = x * Math.cos(turn) - z * Math.sin(turn);
  const z2 = x * Math.sin(turn) + z * Math.cos(turn);
  const depth = 0.55 + z2;
  return {
    x: x2,
    y,
    size: 1.6 + depth * 1.8,
    opacity: Math.max(0.22, Math.min(1, 0.25 + depth * 0.7)),
  };
}

function paint(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, color: string) {
  ctx.clearRect(0, 0, width, height);
  const scale = Math.min(width, height) * 0.42;
  const xStretch = width > height ? 2.35 : 1.7;
  const cx = width * 0.5;
  const cy = height * 0.48;
  for (let index = 0; index < COUNT; index += 1) {
    const point = dot(index, time);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = point.opacity;
    ctx.arc(cx + point.x * scale * xStretch, cy + point.y * scale * 0.85, point.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function DroneBall({ height }: { height: number }) {
  const { colors } = useAppTheme();
  const reduced = useReducedMotion();
  const host = useRef<HTMLElement | null>(null);
  const color = colors.text;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = host.current;
    if (!node) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    node.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let raf = 0;
    const started = performance.now();
    let sized = '';
    const draw = (now: number) => {
      const rect = node.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const nextHeight = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, width < 800 ? 1.25 : 2);
      const key = `${Math.floor(width)}x${Math.floor(nextHeight)}@${ratio}`;
      if (key !== sized) {
        sized = key;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(nextHeight * ratio);
      }
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const frames = ((now - started) / 1000) * 60 * (width < 800 ? 1.75 : 1);
        paint(ctx, width, nextHeight, reduced ? 30 : frames, color);
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.remove();
    };
  }, [color, reduced, height]);

  return <View ref={host as never} style={{ height, width: '100%' }} />;
}
