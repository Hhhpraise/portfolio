import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VantaWavesProps {
  color?: string;
  shininess?: number;
  waveHeight?: number;
  waveSpeed?: number;
  zoom?: number;
  className?: string;
}

const CDN_URL = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';

(window as unknown as Record<string, unknown>).THREE = THREE;

let vantaLoaded = false;
let vantaLoadPromise: Promise<void> | null = null;

function loadVanta(): Promise<void> {
  if (vantaLoaded) return Promise.resolve();
  if (vantaLoadPromise) return vantaLoadPromise;

  vantaLoadPromise = new Promise((resolve) => {
    const el = document.createElement('script');
    el.src = CDN_URL;
    el.async = true;
    el.onload = () => {
      vantaLoaded = true;
      resolve();
    };
    el.onerror = () => {
      vantaLoadPromise = null;
      resolve();
    };
    document.head.appendChild(el);
  });
  return vantaLoadPromise;
}

export default function VantaWaves({
  color = '#ff3d00',
  shininess = 30,
  waveHeight = 20,
  waveSpeed = 0.6,
  zoom = 0.8,
  className = '',
}: VantaWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    loadVanta().then(() => {
      if (cancelled || !window.VANTA?.WAVES) return;

      effectRef.current = window.VANTA.WAVES({
        el: container,
        THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color,
        shininess,
        waveHeight,
        waveSpeed,
        zoom,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [color, shininess, waveHeight, waveSpeed, zoom]);

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
}

declare global {
  interface Window {
    VANTA?: {
      WAVES?: (opts: {
        el: HTMLElement;
        THREE: unknown;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        color?: string;
        shininess?: number;
        waveHeight?: number;
        waveSpeed?: number;
        zoom?: number;
      }) => { destroy: () => void };
    };
  }
}
