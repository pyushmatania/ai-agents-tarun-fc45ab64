import { Howl } from "howler";

// Synthesize sounds using Web Audio API and cache as Howl instances
const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

function generateTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  fadeOut = true
): Promise<string> {
  return new Promise((resolve) => {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dest = ctx.createMediaStreamDestination();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(dest);
    gain.connect(ctx.destination);

    const recorder = new MediaRecorder(dest.stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      ctx.close();
      resolve(url);
    };

    recorder.start();
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => recorder.stop(), duration * 1000 + 100);
  });
}

// Simple click/tap sound using Howl with inline audio
let tapSound: Howl | null = null;
let successSound: Howl | null = null;
let errorSound: Howl | null = null;
let celebrationSound: Howl | null = null;
let streakSound: Howl | null = null;
let xpSound: Howl | null = null;
let levelUpSound: Howl | null = null;
let powerupGreenSound: Howl | null = null;
let powerupBlueSound: Howl | null = null;
let powerupPurpleSound: Howl | null = null;
let powerupGoldSound: Howl | null = null;
let powerupPinkSound: Howl | null = null;
let powerupOrangeSound: Howl | null = null;

let initialized = false;
let muted = false;

// Generate all sounds on first interaction
async function initSounds() {
  if (initialized) return;
  initialized = true;

  try {
    // We use inline base64 tones for instant, reliable playback
    // Tap - short click
    tapSound = new Howl({
      src: ["data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="],
      volume: 0.15,
    });

    // Generate real tones
    const [successUrl, errorUrl, celebUrl, streakUrl, xpUrl, levelUrl,
           puGreenUrl, puBlueUrl, puPurpleUrl, puGoldUrl, puPinkUrl, puOrangeUrl] = await Promise.all([
      generateChime([523, 659, 784], 0.12, 0.25),
      generateChime([392, 330], 0.2, 0.2),
      generateChime([523, 659, 784, 1047], 0.15, 0.3),
      generateChime([440, 554, 659, 880], 0.12, 0.35),
      generateChime([880, 1047], 0.08, 0.2),
      generateChime([523, 659, 784, 1047, 1319], 0.18, 0.4),
      // Powerup sounds — each a distinct short chime
      generateChime([659, 784], 0.06, 0.3),          // green: quick rising
      generateChime([523, 784], 0.08, 0.25),          // blue: wide interval pop
      generateChime([440, 554, 740], 0.07, 0.28),     // purple: mystical triad
      generateChime([880, 1108], 0.05, 0.3),          // gold: bright high ding
      generateChime([698, 880, 1047], 0.06, 0.25),    // pink: sparkly triple
      generateChime([587, 740], 0.07, 0.28),          // orange: warm double
    ]);

    successSound = new Howl({ src: [successUrl], volume: 0.3 });
    errorSound = new Howl({ src: [errorUrl], volume: 0.2 });
    celebrationSound = new Howl({ src: [celebUrl], volume: 0.35 });
    streakSound = new Howl({ src: [streakUrl], volume: 0.3 });
    xpSound = new Howl({ src: [xpUrl], volume: 0.25 });
    levelUpSound = new Howl({ src: [levelUrl], volume: 0.4 });
    powerupGreenSound = new Howl({ src: [puGreenUrl], volume: 0.3 });
    powerupBlueSound = new Howl({ src: [puBlueUrl], volume: 0.3 });
    powerupPurpleSound = new Howl({ src: [puPurpleUrl], volume: 0.3 });
    powerupGoldSound = new Howl({ src: [puGoldUrl], volume: 0.3 });
    powerupPinkSound = new Howl({ src: [puPinkUrl], volume: 0.3 });
    powerupOrangeSound = new Howl({ src: [puOrangeUrl], volume: 0.3 });
  } catch (e) {
    console.warn("Sound init failed:", e);
  }
}

// Generate a chime from a sequence of frequencies
function generateChime(
  frequencies: number[],
  noteDuration: number,
  volume: number
): Promise<string> {
  return new Promise((resolve) => {
    const totalDuration = frequencies.length * noteDuration + 0.3;
    const ctx = audioCtx();
    const dest = ctx.createMediaStreamDestination();
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(dest);
    masterGain.connect(ctx.destination);

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      noteGain.gain.value = 0;
      noteGain.gain.setValueAtTime(volume, ctx.currentTime + i * noteDuration);
      noteGain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * noteDuration + noteDuration + 0.2
      );
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      osc.start(ctx.currentTime + i * noteDuration);
      osc.stop(ctx.currentTime + i * noteDuration + noteDuration + 0.3);
    });

    const recorder = new MediaRecorder(dest.stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      resolve(URL.createObjectURL(blob));
      ctx.close();
    };

    recorder.start();
    setTimeout(() => recorder.stop(), totalDuration * 1000 + 100);
  });
}

// Initialize on first user interaction
if (typeof window !== "undefined") {
  const initOnInteraction = () => {
    initSounds();
    window.removeEventListener("click", initOnInteraction);
    window.removeEventListener("touchstart", initOnInteraction);
  };
  window.addEventListener("click", initOnInteraction, { once: true });
  window.addEventListener("touchstart", initOnInteraction, { once: true });
}

// Public API
export const SFX = {
  tap: () => { if (!muted) tapSound?.play(); },
  success: () => { if (!muted) successSound?.play(); },
  error: () => { if (!muted) errorSound?.play(); },
  celebration: () => { if (!muted) celebrationSound?.play(); },
  streak: () => { if (!muted) streakSound?.play(); },
  xp: () => { if (!muted) xpSound?.play(); },
  levelUp: () => { if (!muted) levelUpSound?.play(); },

  // Power-up sounds by color key
  powerup: (color: string) => {
    if (muted) return;
    const map: Record<string, Howl | null> = {
      green: powerupGreenSound,
      blue: powerupBlueSound,
      purple: powerupPurpleSound,
      gold: powerupGoldSound,
      pink: powerupPinkSound,
      orange: powerupOrangeSound,
    };
    (map[color] || tapSound)?.play();
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(color === "gold" ? [30, 20, 30] : [25]);
    }
  },

  mute: () => { muted = true; },
  unmute: () => { muted = false; },
  isMuted: () => muted,
  toggleMute: () => { muted = !muted; return muted; },
};
