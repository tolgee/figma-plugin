import {
  TolgeeFormat,
  getVariantExample,
  getPluralVariants,
} from "@tginternal/editor";
import { Fragment, h, JSX } from "preact";
import { Muted } from "@create-figma-plugin/ui";
import { useMemo } from "preact/hooks";

type RenderProps = {
  content: string;
  variant: Intl.LDMLPluralRule | undefined;
  locale: string;
  exampleValue?: number;
};

type Props = {
  locale: string;
  value: TolgeeFormat;
  render: (props: RenderProps) => JSX.Element;
  showEmpty?: boolean;
  variantPaddingTop?: number | string;
  setActiveVariant?: (variant: string) => void;
};

export const TranslationPlurals = ({
  locale,
  render,
  value,
  showEmpty,
}: Props) => {
  const variants = useMemo(() => getForms(locale, value), [locale, value]);

  if (value.parameter) {
    return (
      <div className="plural-editor-wrapper">
        <div className="styled-variants">
          {variants
            .filter(
              ([variant]) =>
                showEmpty || value.variants[variant as Intl.LDMLPluralRule]
            )
            .map(([variant, exampleValue]) => (
              <Fragment key={variant}>
                <Muted>{variant}</Muted>
                <div
                  className="styled-variant-content"
                  data-cy="translation-plural-variant"
                >
                  {render({
                    variant: variant as Intl.LDMLPluralRule,
                    content:
                      value.variants[variant as Intl.LDMLPluralRule] || "",
                    exampleValue,
                    locale,
                  })}
                </div>
              </Fragment>
            ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      {render({
        content: value.variants["other"] ?? "",
        locale,
        variant: undefined,
      })}
    </div>
  );
};

function getForms(locale: string, value: TolgeeFormat, exactForms?: number[]) {
  const forms: Set<string> = new Set();
  getPluralVariants(locale).forEach((value) => forms.add(value));
  Object.keys(value.variants).forEach((value) => forms.add(value));
  (exactForms || [])
    .map((value) => `=${value.toString()}`)
    .forEach((value) => forms.add(value));

  const formsArray = sortExactForms(forms);

  return formsArray.map((value) => {
    return [value, getVariantExample(locale, value)] as const;
  });
}

function sortExactForms(forms: Set<string>) {
  return [...forms].sort((a, b) => {
    if (a.startsWith("=") && b.startsWith("=")) {
      return Number(a.substring(1)) - Number(b.substring(1));
    }
    return 0;
  });
}
