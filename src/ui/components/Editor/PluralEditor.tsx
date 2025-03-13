import { TolgeeFormat } from "@tginternal/editor";

import { TranslationPlurals } from "./TranslationPlurals";
import { Editor, EditorProps } from "./Editor";
import { h } from "preact";

type Props = {
  locale: string;
  value: TolgeeFormat;
  onChange?: (value: TolgeeFormat) => void;
  onBlur?: () => void;
  editorProps?: Partial<EditorProps>;
  mode: "placeholders" | "syntax" | "plain";
};

export const PluralEditor = ({
  locale,
  value,
  onChange,
  onBlur,
  editorProps,
  mode,
}: Props) => {
  function handleChange(text: string, variant: string) {
    onChange?.({ ...value, variants: { ...value.variants, [variant]: text } });
  }

  const editorMode = mode;

  return (
    <TranslationPlurals
      value={value}
      locale={locale}
      showEmpty
      variantPaddingTop="8px"
      render={({ content, variant, exampleValue }) => {
        const variantOrOther: Intl.LDMLPluralRule = variant || "other";
        return (
          <div data-cy="translation-editor" data-cy-variant={variant}>
            <Editor
              onBlur={onBlur}
              mode={editorMode}
              value={content}
              onChange={(value) => handleChange(value, variantOrOther)}
              minHeight={value.parameter ? "unset" : "50px"}
              locale={locale}
              examplePluralNum={exampleValue}
              nested={Boolean(variant)}
              {...editorProps}
            />
          </div>
        );
      }}
    />
  );
};
