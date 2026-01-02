/**
 * Plays the demo's key-press sound effects (WAV files in public/pos-demo).
 *
 * @module
 */

/** Available sound effects mapped to their public URL. */
const SOUND_SRC = {
  touch: "/pos-demo/touch.wav",
  clear: "/pos-demo/clear.wav",
  cash: "/pos-demo/cash.wav",
  unlock: "/pos-demo/unlock.wav",
} as const;

/** Name of a playable sound effect. */
export type SoundName = keyof typeof SOUND_SRC;

/** Cached base audio element per sound (cloned on play so taps can overlap). */
const cache = new Map<SoundName, HTMLAudioElement>();

/**
 * Plays the given sound effect once. No-op on the server.
 *
 * @param name - which sound effect to play
 */
export function playSound(name: SoundName): void {
  if (typeof window !== "undefined") {
    let base = cache.get(name);
    if (base === undefined) {
      base = new Audio(SOUND_SRC[name]);
      cache.set(name, base);
    }
    const instance = base.cloneNode() as HTMLAudioElement;
    void instance.play();
  }
}
