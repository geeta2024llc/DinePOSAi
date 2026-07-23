/**
 * KitchenChime - Native Web Audio API Synthesizer
 * Synthesizes an authentic dual-frequency brass kitchen bell chime (Ding-Dong!)
 * with exponential amplitude decay. No external MP3 downloads required.
 */
class KitchenChimeSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  /** Initialize or resume AudioContext to bypass browser autoplay policies */
  public initAudio(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isUnlocked = !!(this.audioCtx && this.audioCtx.state === 'running');
      return this.isUnlocked;
    } catch (e) {
      console.warn('[KitchenChime] AudioContext initialization error:', e);
      return false;
    }
  }

  public getUnlockedStatus(): boolean {
    return this.isUnlocked || (!!this.audioCtx && this.audioCtx.state === 'running');
  }

  /**
   * Play high-pitched dual-tone brass kitchen bell chime (F#6 1479.98Hz & D6 1174.66Hz)
   * High-contrast chime that cuts through noisy restaurant kitchen environments.
   */
  public playNewOrderChime(): void {
    if (!this.initAudio() || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // 1. High Tone (F#6 - 1480 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1479.98, now);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 1.2);

      // 2. Second Tone (D6 - 1175 Hz, delayed 120ms for "Ding-Dong" bell effect)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12);

      gain2.gain.setValueAtTime(0.45, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);

      osc2.start(now + 0.12);
      osc2.stop(now + 1.6);

    } catch (err) {
      console.warn('[KitchenChime] Failed to play chime:', err);
    }
  }

  /**
   * Play single warm confirmation tone when order is marked READY/COMPLETED
   */
  public playOrderCompleteChime(): void {
    if (!this.initAudio() || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      console.warn('[KitchenChime] Failed playing complete chime:', err);
    }
  }
}

export const kitchenChime = new KitchenChimeSynthesizer();
