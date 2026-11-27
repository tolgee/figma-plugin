import { renderIcuForNode } from "$shared/interpolate";
import { getTolgeeFormat } from "$shared/tolgeeFormat";
import type { NodeInfo } from "$shared/types";
import { extractParamNames } from "$ui/lib/logic/icuParams";

/**
 * Per-language sample values on a COPY page — the small inline fields under a
 * parametrised row in CopyView ("name [John]"). A language copy may want
 * "Hello, John" where the source page shows "Ahoj, Zuzko"; the copy screen is
 * otherwise read-only and String details can't be opened there, so these
 * fields are the one thing a copy lets you edit. Nothing goes to Tolgee and
 * neither key nor translation changes: the copy's own stored translation is
 * re-rendered with the new values and written back, and Recreate / Update
 * changed carry the values over (see `sampleValuesByKey`).
 *
 * Mirrors String details' save so both screens store values the same way:
 * named params in `paramsValues`, the plural count in BOTH
 * `paramsValues[pluralName]` and `pluralParamValue`.
 */

export type SampleField = { name: string; value: string; plural: boolean };

/** The plural variable's name, or null for a non-plural string. */
export function pluralNameOf(node: Pick<NodeInfo, "isPlural" | "translation">): string | null {
  if (!node.isPlural) return null;
  return getTolgeeFormat(node.translation ?? "", true, false).parameter ?? "value";
}

/** The editable fields for a node — empty for a string with nothing to fill. */
export function sampleFields(node: NodeInfo): SampleField[] {
  if (!node.connected || !node.key) return [];
  const values = node.paramsValues ?? {};
  const fields: SampleField[] = [];
  const pluralName = pluralNameOf(node);
  if (pluralName) {
    fields.push({
      name: pluralName,
      value: values[pluralName] ?? node.pluralParamValue ?? "1",
      plural: true,
    });
  }
  for (const name of extractParamNames(node.translation ?? "")) {
    if (name === pluralName || fields.some((f) => f.name === name)) continue;
    fields.push({ name, value: values[name] ?? "", plural: false });
  }
  return fields;
}

/** A plural count has to be a number, or the plural rules can't pick a form. */
export function invalidSample(field: SampleField, value: string): string | null {
  if (field.plural && !/^-?\d+(\.\d+)?$/.test(value.trim())) return "Use a number";
  return null;
}

type Update = {
  id: string;
  text: string;
  translation: string;
  isPlural?: boolean;
  pluralParamValue?: string;
  paramsValues?: Record<string, string>;
};

/**
 * The writes that apply `values` to every target (the texts on the copy with
 * the same key). Each target is re-rendered from ITS OWN stored translation;
 * a target whose render fails is left untouched and counted.
 */
export function buildSampleUpdates(
  targets: NodeInfo[],
  values: Record<string, string>,
  language: string,
): { updates: Update[]; failed: number } {
  const updates: Update[] = [];
  let failed = 0;
  for (const target of targets) {
    const paramsValues = { ...(target.paramsValues ?? {}), ...values };
    const pluralName = pluralNameOf(target);
    const count = pluralName ? (paramsValues[pluralName] ?? target.pluralParamValue ?? "1") : undefined;
    const out = renderIcuForNode(
      target.translation,
      { ...target, paramsValues, pluralParamValue: count },
      language,
    );
    if (out.error || !out.text) {
      failed++;
      continue;
    }
    updates.push({
      id: target.id,
      text: out.text,
      translation: target.translation,
      isPlural: target.isPlural,
      pluralParamValue: count,
      paramsValues,
    });
  }
  return { updates, failed };
}

/** Same key (namespace + name) — the texts one edit applies to. */
export function sameKey(a: Pick<NodeInfo, "key" | "ns">, b: Pick<NodeInfo, "key" | "ns">): boolean {
  return a.key === b.key && (a.ns ?? "") === (b.ns ?? "");
}
