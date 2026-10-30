import { Song } from '../types/music';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Equalizer nodes
  private eqFilters: BiquadFilterNode[] = [];
  
  // Audio element for uploaded files or URLs
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  
  // Procedural synth timer
  private synthInterval: number | null = null;
  private localElapsed: number = 0;
  private currentSong: Song | null = null;
  private isPlaying: boolean = false;
  private playbackRate: number = 1.0;
  
  // Listeners
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Analyser Node for dynamic waveforms
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      // 5-band EQ (60Hz, 250Hz, 1000Hz, 4000Hz, 12000Hz)
      const freqs = [60, 250, 1000, 4000, 12000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];
      
      this.eqFilters = freqs.map((freq, i) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = types[i];
        filter.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        filter.gain.setValueAtTime(0, this.ctx!.currentTime);
        return filter;
      });

      // Chain: EQ Filters -> Analyser -> Master Gain -> Destination
      let lastNode: AudioNode = this.eqFilters[0];
      for (let i = 1; i < this.eqFilters.length; i++) {
        lastNode.connect(this.eqFilters[i]);
        lastNode = this.eqFilters[i];
      }
      lastNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public async playSong(song: Song, resumeFrom?: number) {
    this.initContext();
    this.stopCurrent();

    this.currentSong = song;
    this.isPlaying = true;

    const startOffset = resumeFrom !== undefined ? resumeFrom : 0;
    this.localElapsed = startOffset;

    if (song.audioUrl) {
      this.playAudioElement(song.audioUrl, startOffset);
    } else {
      this.playProceduralSynth(song, startOffset);
    }
  }

  private playAudioElement(url: string, offset: number) {
    if (!this.ctx || !this.eqFilters[0]) return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.preload = 'auto';

      try {
        this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
        this.mediaSourceNode.connect(this.eqFilters[0]);
      } catch (err) {
        console.warn('Media element source already attached or error:', err);
      }

      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      });

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.onTimeUpdateCallback && this.currentSong) {
          const cur = this.audioElement.currentTime;
          const duration = this.audioElement.duration || this.currentSong.duration;
          this.localElapsed = cur;
          this.onTimeUpdateCallback(cur, duration);
        }
      });
    }

    this.audioElement.src = url;
    this.audioElement.currentTime = offset;
    this.audioElement.playbackRate = this.playbackRate;
    
    this.audioElement.play().catch((err) => {
      console.warn('Audio URL playback blocked or failed, falling back to distinct procedural synthesizer:', err);
      if (this.currentSong) {
        this.playProceduralSynth(this.currentSong, offset);
      }
    });
  }

  private playProceduralSynth(song: Song, offset: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const preset = song.synthPreset;
    const bpm = preset.bpm || 120;
    const beatDuration = 60 / bpm;
    const totalDuration = song.duration;

    this.localElapsed = offset;
    let nextBeatTime = ctx.currentTime;
    let step = Math.floor(offset / (beatDuration / 2));

    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;

      this.localElapsed += 0.05 * this.playbackRate;
      if (this.localElapsed >= totalDuration) {
        this.pause();
        if (this.onEndedCallback) this.onEndedCallback();
        return;
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.localElapsed, totalDuration);
      }

      // Schedule synthesis audio nodes slightly ahead of time
      const lookahead = 0.15;
      while (nextBeatTime < ctx.currentTime + lookahead) {
        this.renderDistinctSongStep(song, step, nextBeatTime, beatDuration / 2);
        nextBeatTime += (beatDuration / 2) / this.playbackRate;
        step++;
      }
    }, 50);
  }

  private renderDistinctSongStep(song: Song, step: number, time: number, subBeat: number) {
    if (!this.ctx || !this.eqFilters[0]) return;
    const ctx = this.ctx;
    const destination = this.eqFilters[0];
    const preset = song.synthPreset;

    const sixteenth = step % 16;
    const totalStepsInLoop = preset.melodyPattern.length || 16;
    const patternStep = step % totalStepsInLoop;
    const chordIndex = Math.floor((step % 32) / 8) % (preset.chords.length || 1);
    const chord = preset.chords[chordIndex] || [261.63, 329.63, 392.0];

    // --- Drum Pattern tailored to song drumStyle ---
    switch (preset.drumStyle) {
      case '80s-retro': // Driving 80s synthpop (Blinding Lights)
        if (sixteenth === 0 || sixteenth === 8 || sixteenth === 14) {
          this.playKick(ctx, destination, time, 0.45);
        }
        if (sixteenth === 4 || sixteenth === 12) {
          this.playGatedSnare(ctx, destination, time);
        }
        this.playHiHat(ctx, destination, time, sixteenth % 2 === 0 ? 0.07 : 0.03);
        break;

      case 'pop-punch': // Energetic pop (STAY)
        if (sixteenth === 0 || sixteenth === 6 || sixteenth === 10) {
          this.playKick(ctx, destination, time, 0.42);
        }
        if (sixteenth === 4 || sixteenth === 12) {
          this.playSnare(ctx, destination, time, 0.22);
        }
        if (sixteenth % 2 === 0) {
          this.playHiHat(ctx, destination, time, 0.05);
        }
        break;

      case 'marimba-groove': // Tropical dance-pop (Shape of You)
        if (sixteenth === 0 || sixteenth === 10) {
          this.playKick(ctx, destination, time, 0.35);
        }
        if (sixteenth === 4 || sixteenth === 12) {
          this.playWoodblock(ctx, destination, time);
        }
        if (sixteenth % 4 === 2) {
          this.playHiHat(ctx, destination, time, 0.04);
        }
        break;

      case 'lofi-chill': // Relaxed R&B (Nobody Gets Me)
        if (sixteenth === 0 || sixteenth === 7) {
          this.playKick(ctx, destination, time, 0.25);
        }
        if (sixteenth === 8) {
          this.playRimshot(ctx, destination, time);
        }
        if (sixteenth % 2 === 0) {
          this.playHiHat(ctx, destination, time, 0.03);
        }
        break;

      case 'acoustic-ballad': // BIRDS OF A FEATHER
        if (sixteenth === 0 || sixteenth === 8) {
          this.playKick(ctx, destination, time, 0.28);
        }
        if (sixteenth === 4 || sixteenth === 12) {
          this.playSnare(ctx, destination, time, 0.15);
        }
        if (sixteenth % 2 === 0) {
          this.playHiHat(ctx, destination, time, 0.04);
        }
        break;

      case 'cascading-piano': // Golden Hour
        if (sixteenth === 0) {
          this.playKick(ctx, destination, time, 0.3);
        }
        if (sixteenth === 8) {
          this.playSnare(ctx, destination, time, 0.1);
        }
        break;

      default:
        if (sixteenth === 0 || sixteenth === 8) this.playKick(ctx, destination, time, 0.35);
        if (sixteenth === 4 || sixteenth === 12) this.playSnare(ctx, destination, time, 0.18);
        break;
    }

    // --- Bassline tailored to song key & rhythm ---
    const bassNote = preset.bassline[chordIndex] || chord[0] / 2;
    if (preset.drumStyle === '80s-retro') {
      // Driving 16th-note synth bass
      this.playSynthBass(ctx, destination, bassNote, time, subBeat * 0.9, 'sawtooth');
    } else if (sixteenth === 0 || sixteenth === 6 || sixteenth === 10) {
      this.playSynthBass(ctx, destination, bassNote, time, subBeat * 1.6, preset.timbre === 'marimba' ? 'triangle' : 'sine');
    }

    // --- Chords / Harmony ---
    if (sixteenth === 0 || (sixteenth === 6 && preset.drumStyle !== 'cascading-piano')) {
      chord.forEach((freq) => {
        this.playChordTone(ctx, destination, freq, time, subBeat * 3.5, preset.timbre);
      });
    }

    // --- Signature Recognizable Melodic Hook ---
    if (preset.melodyPattern && preset.melodyPattern.length > 0) {
      const melodyEntry = preset.melodyPattern[patternStep];
      if (melodyEntry && melodyEntry.noteIndex >= 0 && preset.scale[melodyEntry.noteIndex]) {
        const leadFreq = preset.scale[melodyEntry.noteIndex];
        const dur = subBeat * (melodyEntry.dur || 1);
        this.playLeadTone(ctx, destination, leadFreq, time, dur, preset.timbre);
      }
    }
  }

  // --- Instrument Synthesis Methods ---
  private playKick(ctx: AudioContext, destination: AudioNode, time: number, vol = 0.4) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playSnare(ctx: AudioContext, destination: AudioNode, time: number, vol = 0.2) {
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    noise.start(time);
    noise.stop(time + 0.14);
  }

  private playGatedSnare(ctx: AudioContext, destination: AudioNode, time: number) {
    // 80s gated snare with noise and body punch
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.08);
    oscGain.gain.setValueAtTime(0.25, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.12);

    this.playSnare(ctx, destination, time, 0.26);
  }

  private playWoodblock(ctx: AudioContext, destination: AudioNode, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(440, time + 0.04);
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.04);
  }

  private playRimshot(ctx: AudioContext, destination: AudioNode, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, time);
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  private playHiHat(ctx: AudioContext, destination: AudioNode, time: number, vol = 0.05) {
    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    noise.start(time);
    noise.stop(time + 0.035);
  }

  private playSynthBass(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType = 'sawtooth'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + dur);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playChordTone(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    time: number,
    dur: number,
    timbre: string
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (timbre === 'marimba' || timbre === 'pluck') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    } else if (timbre === 'rhodes') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.07, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    } else {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, time);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    }

    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playLeadTone(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    time: number,
    dur: number,
    timbre: string
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (timbre === 'marimba') {
      // Warm woody marimba strike
      osc.type = 'sine';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, time);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + Math.min(dur, 0.22));
    } else if (timbre === '80s-retro') {
      // Bright soaring synth hook (Blinding Lights lead)
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, time);
      filter.frequency.exponentialRampToValueAtTime(1200, time + dur);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    } else if (timbre === 'ambient-pad' || timbre === 'cascading-piano') {
      // Sparkle chime / piano
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, time);
      gain.gain.setValueAtTime(0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    } else {
      // Warm melodious lead
      osc.type = 'square';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    }

    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + dur);
  }

  public pause() {
    this.isPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public resume() {
    if (this.currentSong) {
      this.playSong(this.currentSong, this.localElapsed);
    }
  }

  public seek(targetSeconds: number) {
    this.localElapsed = targetSeconds;
    if (this.audioElement && this.currentSong?.audioUrl) {
      this.audioElement.currentTime = targetSeconds;
    }

    if (this.isPlaying && this.currentSong && !this.currentSong.audioUrl) {
      this.playSong(this.currentSong, targetSeconds);
    }

    if (this.onTimeUpdateCallback && this.currentSong) {
      this.onTimeUpdateCallback(targetSeconds, this.currentSong.duration);
    }
  }

  public stopCurrent() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, vol));
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public setEqGain(bandIndex: number, gainDb: number) {
    this.initContext();
    if (this.eqFilters[bandIndex] && this.ctx) {
      this.eqFilters[bandIndex].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getTimeDomainData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }
}

export const audioEngine = new AudioEngine();
