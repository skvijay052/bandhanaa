let audioContext: AudioContext | null = null;
let lastPlayedAt = 0;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) return null;

  try {
    audioContext = new AudioContextConstructor();
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endAt = startAt + duration;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.01);
}

function playChime(context: AudioContext) {
  const startAt = context.currentTime + 0.01;

  // Original two-note Bandhanaa chime generated in-browser. No audio file,
  // sampled recording, or third-party notification sound is used.
  playTone(context, 880, startAt, 0.11, 0.08);
  playTone(context, 1174.66, startAt + 0.085, 0.16, 0.065);
}

export function unlockIncomingMessageSound() {
  const context = getAudioContext();
  if (!context || context.state !== "suspended") return;
  void context.resume().catch(() => undefined);
}

export function playIncomingMessageSound() {
  const context = getAudioContext();
  if (!context) return;

  const now = Date.now();
  if (now - lastPlayedAt < 250) return;
  lastPlayedAt = now;

  if (context.state === "suspended") {
    void context
      .resume()
      .then(() => playChime(context))
      .catch(() => undefined);
    return;
  }

  playChime(context);
}
