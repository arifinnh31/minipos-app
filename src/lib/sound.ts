// Web Audio API pure synthesis sound feedback for cashier speed & confirmation

class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Crisp High-pitch Scanner Beep (similar to Honeywell / Zebra physical barcode scanner)
  playScanBeep() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime); // 1800Hz clear retail beep

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playBeepSuccess() {
    this.playScanBeep();
  }

  // Soft subtle click sound for UI navigation
  playBeepSoft() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  // Satisfying mechanical lock latch sound for terminal locking (F10)
  playLockClick() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const pulses = [
        { freq: 1100, delay: 0, duration: 0.025, vol: 0.1 },
        { freq: 650, delay: 0.035, duration: 0.04, vol: 0.12 },
      ];

      pulses.forEach((p) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, ctx.currentTime + p.delay);

        gain.gain.setValueAtTime(p.vol, ctx.currentTime + p.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.delay + p.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + p.delay);
        osc.stop(ctx.currentTime + p.delay + p.duration);
      });
    } catch {}
  }

  // Melodic Cash Register Ding Chime on Checkout Success
  playCashDing() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.45);
      });
    } catch {
      // Audio fallback
    }
  }

  // Low Warning Buzzer on Void / Error
  playErrorBuzz() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  }
}

export const soundService = new SoundService();
