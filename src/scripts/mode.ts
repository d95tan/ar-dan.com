import type { Mode } from '../site';

export type ModeSource = 'toggle' | 'drag' | 'init';
export type ModeChange = { mode: Mode; source: ModeSource };

const KEY = 'ar-dan:mode';

export const getMode = (): Mode => (document.documentElement.dataset.mode === 'archi' ? 'archi' : 'tech');

export function setMode(mode: Mode, source: ModeSource = 'toggle') {
  if (mode === getMode() && source !== 'init') return;
  document.documentElement.dataset.mode = mode;
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage can be unavailable in private browsing */
  }
  window.dispatchEvent(new CustomEvent<ModeChange>('modechange', { detail: { mode, source } }));
}

export function onModeChange(fn: (change: ModeChange) => void) {
  window.addEventListener('modechange', (e) => fn((e as CustomEvent<ModeChange>).detail));
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs a DOM update inside a same-document view transition when the browser supports it. */
export function withTransition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) return update();
  document.startViewTransition(update);
}
