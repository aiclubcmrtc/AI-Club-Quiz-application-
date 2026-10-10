// Web Audio API Synthesizer for Quiz Sound Effects
// Works without any external audio files!

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play countdown tick
  playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }

  // Play correct answer chime (cheerful major chord)
  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Play incorrect buzzer
  playIncorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn(e);
    }
  }

  // Play button click pop
  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn(e);
    }
  }

  // Play victory fanfare
  playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const fanfare = [
        { f: 523.25, t: 0, d: 0.15 },    // C5
        { f: 523.25, t: 0.15, d: 0.15 }, // C5
        { f: 523.25, t: 0.3, d: 0.15 },  // C5
        { f: 659.25, t: 0.45, d: 0.4 },  // E5
        { f: 587.33, t: 0.85, d: 0.15 }, // D5
        { f: 783.99, t: 1.0, d: 0.6 }    // G5
      ];
      fanfare.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Play prestigious Master Admin access sound (cyber security clearance sound)
  playMasterLogin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // 1. Cyber Security Access Swell (Deep authoritative sub-bass pulse)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(110, now); // A2
      bassOsc.frequency.exponentialRampToValueAtTime(73.4, now + 0.55); // D2
      bassGain.gain.setValueAtTime(0.24, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.65);

      // 2. Futuristic Digital Authorization Arpeggio (Rising high-tech triad)
      const cyberSequence = [
        { freq: 587.33, start: 0.00, dur: 0.14 },  // D5
        { freq: 880.00, start: 0.09, dur: 0.16 },  // A5
        { freq: 1174.66, start: 0.18, dur: 0.20 }, // D6
        { freq: 1760.00, start: 0.27, dur: 0.55 }  // A6 (High harmonic ring)
      ];

      cyberSequence.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.linearRampToValueAtTime(0.20, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });

      // 3. Crisp digital confirmation sparkle (Double beep harmonic)
      const sparkleOsc1 = ctx.createOscillator();
      const sparkleGain1 = ctx.createGain();
      sparkleOsc1.type = 'sine';
      sparkleOsc1.frequency.setValueAtTime(2093.00, now + 0.28); // C7
      sparkleGain1.gain.setValueAtTime(0.12, now + 0.28);
      sparkleGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      sparkleOsc1.connect(sparkleGain1);
      sparkleGain1.connect(ctx.destination);
      sparkleOsc1.start(now + 0.28);
      sparkleOsc1.stop(now + 0.6);

      const sparkleOsc2 = ctx.createOscillator();
      const sparkleGain2 = ctx.createGain();
      sparkleOsc2.type = 'sine';
      sparkleOsc2.frequency.setValueAtTime(2637.02, now + 0.36); // E7
      sparkleGain2.gain.setValueAtTime(0.14, now + 0.36);
      sparkleGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      sparkleOsc2.connect(sparkleGain2);
      sparkleGain2.connect(ctx.destination);
      sparkleOsc2.start(now + 0.36);
      sparkleOsc2.stop(now + 0.7);

    } catch (e) {
      console.warn(e);
    }
  }
}

export const sounds = new SoundEngine();
