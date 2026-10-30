import React, { useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { X, Sliders, Zap, RotateCcw } from 'lucide-react';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbackRate: number;
  onRateChange: (rate: number) => void;
}

interface EQBand {
  label: string;
  freq: string;
  gain: number; // in dB
}

const EQ_PRESETS: Record<string, number[]> = {
  'Balanced (Flat)': [0, 0, 0, 0, 0],
  'Bass Boost': [8, 5, 1, 0, 2],
  'Sunset Warmth': [5, 4, 2, -1, 3],
  'Vocal Clarity': [-2, 1, 5, 4, 1],
  'Electronic Club': [6, 3, -1, 4, 6],
  'Acoustic Pop': [3, 2, 0, 3, 4],
};

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  playbackRate,
  onRateChange,
}) => {
  const [bands, setBands] = useState<EQBand[]>([
    { label: 'Sub', freq: '60 Hz', gain: 0 },
    { label: 'Bass', freq: '250 Hz', gain: 0 },
    { label: 'Mid', freq: '1 kHz', gain: 0 },
    { label: 'Treble', freq: '4 kHz', gain: 0 },
    { label: 'Air', freq: '12 kHz', gain: 0 },
  ]);
  const [activePreset, setActivePreset] = useState<string>('Balanced (Flat)');

  if (!isOpen) return null;

  const handleGainChange = (index: number, newGain: number) => {
    const updated = [...bands];
    updated[index].gain = newGain;
    setBands(updated);
    setActivePreset('Custom');
    audioEngine.setEqGain(index, newGain);
  };

  const applyPreset = (presetName: string) => {
    const presetGains = EQ_PRESETS[presetName];
    if (!presetGains) return;

    const updated = bands.map((band, i) => {
      const g = presetGains[i];
      audioEngine.setEqGain(i, g);
      return { ...band, gain: g };
    });

    setBands(updated);
    setActivePreset(presetName);
  };

  const resetEQ = () => {
    applyPreset('Balanced (Flat)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 flex flex-col shadow-2xl z-10 border border-amber-500/25 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Audio Equalizer
              </h2>
              <p className="text-xs text-amber-300/70">
                5-Band Hardware-level EQ & Dynamics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetEQ}
              title="Reset EQ"
              aria-label="Reset Equalizer"
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Equalizer"
              className="w-8 h-8 rounded-full hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80 mb-2 block">
            Sound Presets
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.keys(EQ_PRESETS).map((p) => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium truncate transition-all cursor-pointer ${
                  activePreset === p
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/30'
                    : 'bg-white/5 text-stone-300 hover:bg-white/10'
                }`}
              >
                {p.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Band Vertical Slider Stage */}
        <div className="py-4 my-2 px-4 rounded-2xl bg-black/40 border border-amber-500/20">
          <div className="grid grid-cols-5 gap-2 h-44 items-end pb-2">
            {bands.map((band, idx) => (
              <div key={band.freq} className="flex flex-col items-center h-full justify-between">
                <span className="text-[10px] font-mono text-amber-300 tabular-nums">
                  {band.gain > 0 ? `+${band.gain}` : band.gain}dB
                </span>

                {/* Vertical Range Slider */}
                <div className="h-28 flex items-center justify-center relative">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={band.gain}
                    onChange={(e) => handleGainChange(idx, parseInt(e.target.value, 10))}
                    aria-label={`Gain for ${band.freq}`}
                    className="w-24 -rotate-90 origin-center cursor-pointer"
                  />
                </div>

                <div className="text-center mt-1">
                  <span className="text-xs font-semibold text-white block">
                    {band.label}
                  </span>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {band.freq}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playback Rate / Tempo Controls */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2">
            <span className="flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Playback Speed</span>
            </span>
            <span className="font-mono">{playbackRate}x</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onRateChange(rate)}
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                    : 'bg-white/5 text-stone-300 hover:bg-white/10'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
