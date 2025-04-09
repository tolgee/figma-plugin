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
  const variants = useMemo(() => {
    const existing = new Set(Object.keys(value.variants));
    const required = getPluralVariants(locale);
    required.forEach((val) => existing.delete(val));
    const result = Array.from(existing).map((value) => {
      return [value, getVariantExample(locale, value)] as const;
    });
    required.forEach((value) => {
      result.push([value, getVariantExample(locale, value)]);
    });
    return result;
  }, [locale]);

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
