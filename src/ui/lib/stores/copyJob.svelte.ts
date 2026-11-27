/**
 * The copy job currently running (Recreate copy / Update changed), kept
 * OUTSIDE any view. A Recreate deletes the very page the CopyView is showing,
 * main switches to the source page, App routes to Index and the CopyView —
 * with its progress bar — unmounts mid-run. The user then watched
 * "Removing the old copy…" on one screen and nothing at all on the next
 * until the fresh copy appeared. App.svelte renders this job above whatever
 * route is active, so the bar survives the page switch.
 */
export type CopyJobKind = "recreate" | "update";

export type CopyJob = {
  kind: CopyJobKind;
  phase: string;
  current: number;
  total: number;
};

let job = $state<CopyJob | null>(null);

export const copyJob = {
  get value(): CopyJob | null {
    return job;
  },
  start(kind: CopyJobKind, phase: string): void {
    job = { kind, phase, current: 0, total: 0 };
  },
  progress(current: number, total: number, phase: string): void {
    if (!job) return;
    job = { ...job, current, total, phase };
  },
  clear(): void {
    job = null;
  },
};
