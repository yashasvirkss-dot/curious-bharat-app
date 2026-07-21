// Premium Web Audio Synthesizer Sound System
// Procedural real-time synthesis for ultra low latency and zero file downloading overhead

export type SoundType =
  | 'Soft Click'
  | 'Digital Tap'
  | 'Crystal Click'
  | 'Glass Ping'
  | 'Success Chime'
  | 'Elegant Bell'
  | 'Notification Pop'
  | 'Smooth Whoosh'
  | 'Swipe Transition'
  | 'Neural Chime'
  | 'Futuristic Ping'
  | 'UI Pop'
  | 'Toggle Tick'
  | 'Soft Error'
  | 'Gentle Alert'
  | 'Ambient Pulse'
  | 'Reward Sparkle'
  | 'Luxury Chime'
  | 'Hologram Beep'
  | 'Quantum Pulse'
  | 'click' // Backwards compatibility
  | 'correct' // Backwards compatibility
  | 'wrong' // Backwards compatibility
  | 'success' // Backwards compatibility
  | 'victory'; // Backwards compatibility

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: SoundType) {
  try {
    // Read audio settings directly from localStorage for instant, synchronous configuration
    const isEnabled = localStorage.getItem('premium_sound_enabled') !== 'false'; // defaults to true
    if (!isEnabled) return;

    const volumeStr = localStorage.getItem('premium_sound_volume');
    const globalVolume = volumeStr !== null ? parseFloat(volumeStr) : 0.5; // defaults to 0.5

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(globalVolume, now);
    masterGain.connect(ctx.destination);

    // Helpers to create sound nodes
    const createOscillator = (freq: number, oscType: OscillatorType = 'sine'): OscillatorNode => {
      const osc = ctx.createOscillator();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, now);
      return osc;
    };

    const playTone = (freq: number, duration: number, startVol: number, oscType: OscillatorType = 'sine', endVol = 0) => {
      const osc = createOscillator(freq, oscType);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(startVol, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol), now + duration);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
    };

    // Map legacy names to premium sound types
    let mappedType = type;
    if (type === 'click') mappedType = 'Soft Click';
    if (type === 'correct' || type === 'success') mappedType = 'Success Chime';
    if (type === 'wrong') mappedType = 'Soft Error';
    if (type === 'victory') mappedType = 'Reward Sparkle';

    switch (mappedType) {
      case 'Soft Click': {
        const osc = createOscillator(520, 'sine');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'Digital Tap': {
        const osc = createOscillator(900, 'triangle');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'Crystal Click': {
        const osc = createOscillator(1800, 'sine');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'Glass Ping': {
        // High frequency bell with sub harmonics
        const o1 = createOscillator(2200, 'sine');
        const o2 = createOscillator(1100, 'sine');
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();
        g1.gain.setValueAtTime(0.15, now);
        g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        g2.gain.setValueAtTime(0.05, now);
        g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        o1.connect(g1).connect(masterGain);
        o2.connect(g2).connect(masterGain);
        o1.start(now); o1.stop(now + 0.4);
        o2.start(now); o2.stop(now + 0.35);
        break;
      }
      case 'Success Chime': {
        // Happy major arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((f, i) => {
          const osc = createOscillator(f, 'sine');
          const gain = ctx.createGain();
          const start = now + i * 0.06;
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.35);
        });
        break;
      }
      case 'Elegant Bell': {
        const osc = createOscillator(880, 'sine');
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'Notification Pop': {
        const osc = createOscillator(400, 'sine');
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'Smooth Whoosh': {
        const osc = createOscillator(150, 'triangle');
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'Swipe Transition': {
        const osc = createOscillator(300, 'sine');
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'Neural Chime': {
        // High-tech shimmering neural ring
        const o1 = createOscillator(1200, 'sine');
        const o2 = createOscillator(1600, 'sine');
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        o1.connect(g);
        o2.connect(g);
        g.connect(masterGain);
        o1.start(now); o1.stop(now + 0.5);
        o2.start(now); o2.stop(now + 0.5);
        break;
      }
      case 'Futuristic Ping': {
        const osc = createOscillator(1500, 'sawtooth');
        osc.frequency.linearRampToValueAtTime(400, now + 0.25);
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(2000, now);
        lowpass.frequency.exponentialRampToValueAtTime(500, now + 0.25);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(lowpass).connect(gain).connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'UI Pop': {
        const osc = createOscillator(320, 'sine');
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'Toggle Tick': {
        const osc = createOscillator(1200, 'triangle');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.03);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
      case 'Soft Error': {
        // Quick sad double pulse
        const notes = [180, 150];
        notes.forEach((f, i) => {
          const osc = createOscillator(f, 'sawtooth');
          const start = now + i * 0.12;
          const gain = ctx.createGain();
          const lowpass = ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(400, now);
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.linearRampToValueAtTime(0.0001, start + 0.12);
          osc.connect(lowpass).connect(gain).connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.12);
        });
        break;
      }
      case 'Gentle Alert': {
        // Friendly double chirp
        const notes = [600, 600];
        notes.forEach((f, i) => {
          const osc = createOscillator(f, 'sine');
          const start = now + i * 0.15;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.14, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.12);
        });
        break;
      }
      case 'Ambient Pulse': {
        const osc = createOscillator(110, 'sine');
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'Reward Sparkle': {
        // Sparkly high cascade
        const notes = [880, 1100, 1320, 1760, 2200];
        notes.forEach((f, i) => {
          const osc = createOscillator(f, 'sine');
          const start = now + i * 0.05;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.4);
        });
        break;
      }
      case 'Luxury Chime': {
        // High-end majestic 5th chords
        const notes = [329.63, 493.88, 659.25, 987.77]; // E4, B4, E5, B5 (Power intervals)
        notes.forEach((f, i) => {
          const osc = createOscillator(f, 'sine');
          const start = now + i * 0.04;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.1, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(start);
          osc.stop(start + 0.7);
        });
        break;
      }
      case 'Hologram Beep': {
        const osc = createOscillator(1600, 'sine');
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.setValueAtTime(2000, now + 0.05);
        osc.frequency.setValueAtTime(1800, now + 0.1);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'Quantum Pulse': {
        const osc = createOscillator(90, 'triangle');
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(8, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(filter).connect(gain).connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
    }
  } catch (err) {
    console.warn('Procedural synthesis click failed:', err);
  }
}
