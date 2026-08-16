import React, { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  /** The live microphone stream to visualize. If omitted while active, the
   *  component opens its own stream (visualization only). */
  stream?: MediaStream | null;
  /** Whether the mic is live and the waveform should animate. */
  active: boolean;
  /** Bar color. Defaults to the brand/primary color, falling back to a blue. */
  color?: string;
  height?: number;
  /** Called once real sound (above the noise floor) has been detected. */
  onSoundDetected?: () => void;
}

/**
 * Live microphone waveform. Draws mirrored frequency bars from a Web Audio
 * AnalyserNode so the test-taker can see their voice is being picked up —
 * replacing the distracting live transcript. Pure visualization: it never
 * records or uploads anything.
 */
const AudioWaveform: React.FC<AudioWaveformProps> = ({
  stream,
  active,
  color,
  height = 96,
  onSoundDetected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const ownStreamRef = useRef<MediaStream | null>(null);
  const soundFiredRef = useRef(false);
  const [heard, setHeard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resolveColor = (): string => {
      if (color) return color;
      if (typeof window !== 'undefined') {
        const brand = getComputedStyle(document.documentElement)
          .getPropertyValue('--brand')
          .trim();
        if (brand) return brand;
      }
      return '#2563eb';
    };

    const teardown = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try { sourceRef.current?.disconnect(); } catch { /* noop */ }
      sourceRef.current = null;
      analyserRef.current = null;
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => { /* noop */ });
      }
      audioCtxRef.current = null;
      if (ownStreamRef.current) {
        ownStreamRef.current.getTracks().forEach((t) => t.stop());
        ownStreamRef.current = null;
      }
    };

    const drawIdle = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mid = canvas.height / 2;
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(canvas.width, mid);
      ctx.stroke();
    };

    const start = async () => {
      let s = stream ?? null;
      if (!s) {
        try {
          s = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
          ownStreamRef.current = s;
        } catch {
          drawIdle();
          return;
        }
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      try {
        const source = audioCtx.createMediaStreamSource(s);
        source.connect(analyser);
        sourceRef.current = source;
      } catch {
        drawIdle();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);
      const barCount = 40;
      const fillColor = resolveColor();

      const render = () => {
        const canvas = canvasRef.current;
        const analyserNode = analyserRef.current;
        if (!canvas || !analyserNode) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyserNode.getByteFrequencyData(data);

        // Average level for the "we can hear you" signal.
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += data[i];
        const avg = sum / bufferLength;
        if (avg > 12 && !soundFiredRef.current) {
          soundFiredRef.current = true;
          setHeard(true);
          onSoundDetected?.();
        }

        const w = canvas.width;
        const h = canvas.height;
        const mid = h / 2;
        ctx.clearRect(0, 0, w, h);

        const gap = 3;
        const barWidth = (w - gap * (barCount - 1)) / barCount;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const v = data[i * step] / 255; // 0..1
          const barH = Math.max(2, v * (h * 0.9));
          const x = i * (barWidth + gap);
          const grad = ctx.createLinearGradient(0, mid - barH / 2, 0, mid + barH / 2);
          grad.addColorStop(0, fillColor);
          grad.addColorStop(1, `${fillColor}66`);
          ctx.fillStyle = grad;
          const r = Math.min(barWidth / 2, 3);
          const y = mid - barH / 2;
          // rounded bar
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + barWidth, y, x + barWidth, y + barH, r);
          ctx.arcTo(x + barWidth, y + barH, x, y + barH, r);
          ctx.arcTo(x, y + barH, x, y, r);
          ctx.arcTo(x, y, x + barWidth, y, r);
          ctx.closePath();
          ctx.fill();
        }

        if (!prefersReduced) {
          rafRef.current = requestAnimationFrame(render);
        }
      };

      if (audioCtx.state === 'suspended') {
        try { await audioCtx.resume(); } catch { /* noop */ }
      }
      render();
    };

    if (active) {
      soundFiredRef.current = false;
      setHeard(false);
      start();
    } else {
      teardown();
      drawIdle();
    }

    return () => {
      cancelled = true;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stream, color]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={640}
        height={height}
        className="w-full rounded-lg bg-muted/40"
        style={{ height }}
        role="img"
        aria-label={active ? 'Live microphone input' : 'Microphone idle'}
      />
      {active && (
        <p className="mt-2 text-center text-xs text-muted-foreground" aria-live="polite">
          {heard ? '🎙️ We can hear you — keep speaking' : 'Listening… start speaking'}
        </p>
      )}
    </div>
  );
};

export default AudioWaveform;
