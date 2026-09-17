/**
 * Central icon-size scale (in px), tuned to pair with the plugin's text sizes.
 *
 * Rule of thumb: an inline icon reads balanced at roughly font-size + 2–4px.
 * Changing a value here resizes every icon in that tier across the whole UI —
 * this is the single source of truth, so prefer `ICON.*` over hard-coded sizes.
 *
 *  - `badge`  — small glyphs inside badges / pills (sits by ~10px badge text).
 *  - `marker` — standalone status markers next to a row's text (conflict flags).
 *  - `inline` — sits next to body text (11–12px) or inside small markers.
 *  - `action` — buttons, header actions, toggles.
 *  - `hero`   — large feature glyphs in empty states.
 */
export const ICON = {
  badge: 12,
  marker: 14,
  inline: 16,
  action: 18,
  hero: 32,
} as const;

export type IconSize = (typeof ICON)[keyof typeof ICON];
