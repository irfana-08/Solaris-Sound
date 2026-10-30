import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface AudioWaveformProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  barCount = 12,
  className = '',
  size = 'md'
}) => {
  const barsRef = useRef<HTMLDivElement[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const updateBars = () => {
      if (!active) return;

      if (isPlaying) {
        const freqData = audioEngine.getFrequencyData();
        const step = Math.max(1, Math.floor(freqData.length / barCount));

        for (let i = 0; i < barCount; i++) {
          const bar = barsRef.current[i];
          if (bar) {
            const rawVal = freqData[i * step] || 0;
            // Normalize value between 15% and 100%
            const heightPercent = Math.max(15, Math.min(100, (rawVal / 255) * 100));
            bar.style.height = `${heightPercent}%`;
          }
        }
      } else {
        // Idle gentle waveform
        for (let i = 0; i < barCount; i++) {
          const bar = barsRef.current[i];
          if (bar) {
            // Static pleasant gentle wave
            const defaultHeights = [25, 45, 75, 50, 90, 65, 40, 80, 55, 30, 60, 35];
            bar.style.height = `${defaultHeights[i % defaultHeights.length]}%`;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(updateBars);
    };

    animFrameRef.current = requestAnimationFrame(updateBars);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, barCount]);

  const heightClass = size === 'sm' ? 'h-4 gap-0.5' : size === 'lg' ? 'h-10 gap-1.5' : 'h-6 gap-1';
  const barWidth = size === 'sm' ? 'w-0.5' : size === 'lg' ? 'w-1.5' : 'w-1';

  return (
    <div className={`flex items-center justify-center ${heightClass} ${className}`} aria-label="Audio Waveform Visualizer">
      {Array.from({ length: barCount }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) barsRef.current[index] = el;
          }}
          className={`${barWidth} rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-300 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(251,191,36,0.5)]`}
          style={{ height: '35%' }}
        />
      ))}
    </div>
  );
};
