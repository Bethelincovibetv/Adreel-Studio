// Web Audio API engine for upbeat background arpeggio, bass groove, whooshes, and pop sound effects

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private enableMusic: boolean = true;
  private enableSFX: boolean = true;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private currentStep: number = 0;
  private bpm: number = 124;

  // Scale: Pentatonic C - G - Am - F
  private arpFrequencies = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    196.00, 246.94, 293.66, 392.00, // G3, B3, D4, G4
    220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
    174.61, 220.00, 261.63, 349.23, // F3, A3, C4, F4
  ];

  private bassFrequencies = [
    65.41, 65.41, 49.00, 49.00, // C2, C2, G1, G1
    55.00, 55.00, 43.65, 43.65, // A1, A1, F1, F1
  ];

  constructor() {
    // Lazily init AudioContext upon user gesture
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.enableMusic ? 0.35 : 0;

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.enableSFX ? 0.6 : 0;

    // Media stream destination for recording
    this.mediaDest = this.ctx.createMediaStreamDestination();

    // Route gains
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);

    // Master outputs to both speakers and recording stream
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.mediaDest);
  }

  public getAudioStream(): MediaStream | null {
    this.init();
    return this.mediaDest ? this.mediaDest.stream : null;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setToggles(enableMusic: boolean, enableSFX: boolean) {
    this.enableMusic = enableMusic;
    this.enableSFX = enableSFX;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enableMusic ? 0.35 : 0, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enableSFX ? 0.6 : 0, this.ctx.currentTime);
    }
  }

  public startPlayback() {
    this.init();
    this.resume();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const stepDuration = (60 / this.bpm) / 4; // 16th notes
    let nextNoteTime = this.ctx!.currentTime;

    const schedule = () => {
      if (!this.isPlaying || !this.ctx) return;
      while (nextNoteTime < this.ctx.currentTime + 0.1) {
        this.playStep(nextNoteTime, this.currentStep);
        nextNoteTime += stepDuration;
        this.currentStep = (this.currentStep + 1) % 64;
      }
    };

    this.intervalId = window.setInterval(schedule, 25);
  }

  public stopPlayback() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playStep(time: number, step: number) {
    if (!this.ctx || !this.musicGain || !this.enableMusic) return;

    // 1. Kick on quarter notes
    if (step % 4 === 0) {
      this.playKick(time);
    }

    // 2. Hi-hat on offbeats
    if (step % 2 === 1) {
      this.playHiHat(time);
    }

    // 3. Bass line
    if (step % 8 === 0) {
      const bassIdx = Math.floor(step / 8) % this.bassFrequencies.length;
      this.playBass(time, this.bassFrequencies[bassIdx]);
    }

    // 4. Arpeggiated melody note
    const arpIdx = (step % 16);
    const freq = this.arpFrequencies[arpIdx];
    this.playArpNote(time, freq);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.18);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private playHiHat(time: number) {
    if (!this.ctx || !this.musicGain) return;
    // Synthesize hi-hat with high-pass filtered noise
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playBass(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.32);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  private playArpNote(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.17);
  }

  // SFX: Whoosh for scene wipe transitions
  public playWhoosh(delay: number = 0) {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || !this.enableSFX) return;

    const time = this.ctx.currentTime + delay;
    const duration = 0.35;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3;
    filter.frequency.setValueAtTime(300, time);
    filter.frequency.exponentialRampToValueAtTime(2600, time + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, time + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.4, time + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  // SFX: Pop sound when feature cards & checkmarks appear
  public playPop(delay: number = 0) {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || !this.enableSFX) return;

    const time = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.09);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // SFX: Coin / Cash chime
  public playChime(delay: number = 0) {
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain || !this.enableSFX) return;

    const time = this.ctx.currentTime + delay;
    [1200, 1800, 2400].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + idx * 0.04);

      gain.gain.setValueAtTime(0.2, time + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.04 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time + idx * 0.04);
      osc.stop(time + idx * 0.04 + 0.25);
    });
  }
}

export const soundEngine = new SoundEngine();
