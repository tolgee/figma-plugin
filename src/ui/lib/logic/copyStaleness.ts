/**
 * The staleness banner's wording — what changed on the original page, in
 * frames, so the user can tell a one-frame addition (a quick "Update changed
 * frames") from a reshuffle (a full "Recreate copy").
 */
export type StalenessFrames = { added: number; removed: number; changed: number; mappable: boolean };

export function stalenessSummary(frames: StalenessFrames | null | undefined): string | null {
  if (!frames) return null;
  const parts: string[] = [];
  if (frames.added) parts.push(`${frames.added} new ${frames.added === 1 ? "frame" : "frames"}`);
  if (frames.changed) parts.push(`${frames.changed} with changed keys`);
  if (frames.removed) parts.push(`${frames.removed} removed`);
  return parts.length ? parts.join(", ") : null;
}

/** "Update changed frames" is offered only when the copy carries the frame
 *  mapping AND the diff found something at frame level to act on. */
export function canUpdateFrames(frames: StalenessFrames | null | undefined): boolean {
  return Boolean(frames?.mappable && frames.added + frames.removed + frames.changed > 0);
}

export const UPDATE_FRAMES_TOOLTIP = "Updates new frames and frames with changed keys. Fast action.";

export const RECREATE_TOOLTIP =
  "Deletes this copy and clones the whole page again. Slow — for when the design changed.";
