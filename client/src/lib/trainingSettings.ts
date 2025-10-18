const KEY = "training-media-settings";

export type TrainingMediaSettings = {
  opacity: number; // 0..1
  blur: number;    // px
  gradient: boolean;
};

const DEFAULTS: TrainingMediaSettings = { opacity: 0.3, blur: 1, gradient: false };

export function getMediaSettings(): TrainingMediaSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TrainingMediaSettings>;
    return {
      opacity: typeof parsed.opacity === 'number' ? Math.min(1, Math.max(0, parsed.opacity)) : DEFAULTS.opacity,
      blur: typeof parsed.blur === 'number' ? Math.max(0, parsed.blur) : DEFAULTS.blur,
      gradient: typeof parsed.gradient === 'boolean' ? parsed.gradient : DEFAULTS.gradient,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveMediaSettings(next: TrainingMediaSettings) {
  localStorage.setItem(KEY, JSON.stringify(next));
  // Notify other tabs/components if needed
  window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: JSON.stringify(next) } as any));
}

export function resetMediaSettings() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: null } as any));
}
