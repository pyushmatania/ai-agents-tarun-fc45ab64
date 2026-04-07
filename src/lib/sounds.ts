import { Howl } from "howler";

// Synthesize sounds using Web Audio API and cache as Howl instances
const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

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

// Sound instances
let tapSound: Howl | null = null;
let successSound: Howl | null = null;
let errorSound: Howl | null = null;
let celebrationSound: Howl | null = null;
let streakSound: Howl | null = null;
let xpSound: Howl | null = null;
let levelUpSound: Howl | null = null;
let whooshSound: Howl | null = null;
let selectSound: Howl | null = null;
let popSound: Howl | null = null;
let bootSound: Howl | null = null;
let powerupGreenSound: Howl | null = null;
let powerupBlueSound: Howl | null = null;
let powerupPurpleSound: Howl | null = null;
let powerupGoldSound: Howl | null = null;
let powerupPinkSound: Howl | null = null;
let powerupOrangeSound: Howl | null = null;

let initialized = false;
let muted = false;

async function initSounds() {
  if (initialized) return;
  initialized = true;

  try {
    tapSound = new Howl({
      src: ["data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="],
      volume: 0.15,
    });

    const [successUrl, errorUrl, celebUrl, streakUrl, xpUrl, levelUrl,
           whooshUrl, selectUrl, popUrl, bootUrl,
           puGreenUrl, puBlueUrl, puPurpleUrl, puGoldUrl, puPinkUrl, puOrangeUrl] = await Promise.all([
      generateChime([523, 659, 784], 0.12, 0.25),
      generateChime([392, 330], 0.2, 0.2),
      generateChime([523, 659, 784, 1047], 0.15, 0.3),
      generateChime([440, 554, 659, 880], 0.12, 0.35),
      generateChime([880, 1047], 0.08, 0.2),
      generateChime([523, 659, 784, 1047, 1319], 0.18, 0.4),
      // Whoosh — quick sweep
      generateChime([200, 800], 0.04, 0.15),
      // Select — bright pop
      generateChime([659, 880], 0.05, 0.2),
      // Pop — bubbly single
      generateChime([1047], 0.03, 0.18),
      // Boot — ascending fanfare
      generateChime([330, 440, 554, 659, 784], 0.1, 0.3),
      // Powerups
      generateChime([659, 784], 0.06, 0.3),
      generateChime([523, 784], 0.08, 0.25),
      generateChime([440, 554, 740], 0.07, 0.28),
      generateChime([880, 1108], 0.05, 0.3),
      generateChime([698, 880, 1047], 0.06, 0.25),
      generateChime([587, 740], 0.07, 0.28),
    ]);

    successSound = new Howl({ src: [successUrl], volume: 0.3 });
    errorSound = new Howl({ src: [errorUrl], volume: 0.2 });
    celebrationSound = new Howl({ src: [celebUrl], volume: 0.35 });
    streakSound = new Howl({ src: [streakUrl], volume: 0.3 });
    xpSound = new Howl({ src: [xpUrl], volume: 0.25 });
    levelUpSound = new Howl({ src: [levelUrl], volume: 0.4 });
    whooshSound = new Howl({ src: [whooshUrl], volume: 0.2 });
    selectSound = new Howl({ src: [selectUrl], volume: 0.25 });
    popSound = new Howl({ src: [popUrl], volume: 0.2 });
    bootSound = new Howl({ src: [bootUrl], volume: 0.35 });
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
  whoosh: () => { if (!muted) whooshSound?.play(); },
  select: () => { if (!muted) selectSound?.play(); },
  pop: () => { if (!muted) popSound?.play(); },
  boot: () => { if (!muted) bootSound?.play(); },

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
    if (navigator.vibrate) {
      navigator.vibrate(color === "gold" ? [30, 20, 30] : [25]);
    }
  },

  mute: () => { muted = true; },
  unmute: () => { muted = false; },
  isMuted: () => muted,
  toggleMute: () => { muted = !muted; return muted; },
};
