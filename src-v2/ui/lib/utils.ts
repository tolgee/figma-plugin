import { type ClassValue, clsx } from "clsx";

/**
 * Conditionally compose Tailwind class strings.
 *
 * We intentionally avoid `tailwind-merge` here: it ships ~146 kB / ~25 kB
 * gzip of conflict-resolution rules that we don't meaningfully exercise
 * inside this Figma plugin (we don't compose orthogonal utilities from
 * untrusted callers — components own their base classes and consumers
 * extend, not override). If a caller needs to override a base utility,
 * Tailwind's source-order specificity rules take care of it; in the
 * rare cases that breaks down, the caller can drop the base class with
 * a conditional instead.
 */
export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs);
}
