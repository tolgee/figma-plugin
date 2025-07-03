import React, { h, RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { minimalSetup } from "codemirror";
import { Compartment, EditorState, Prec } from "@codemirror/state";
import { ViewUpdate, EditorView, keymap, KeyBinding } from "@codemirror/view";
import {
  tolgeeSyntax,
  PlaceholderPlugin,
  TolgeeHighlight,
} from "@tginternal/editor";
import "!./StringsEditor.css";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete";

const editorSyntaxColors = {
  function: "var(--syntax-color-function)",
  other: "var(--syntax-color-other)",
  main: "var(--figma-color-text)",
};

export type EditorProps = {
  value: string;
  onChange?: (val: string) => void;
  background?: string;
  mode: "placeholders" | "syntax" | "plain";
  autofocus?: boolean;
  minHeight?: number | string;
  onBlur?: () => void;
  onFocus?: () => void;
  shortcuts?: KeyBinding[];
  autoScrollIntoView?: boolean;
  locale?: string;
  examplePluralNum?: number;
  nested?: boolean;
  disabled?: boolean;
};

function useRefGroup<T>(value: T): RefObject<T> {
  const refObject = useRef(value);
  refObject.current = value;
  return refObject;
}

export const StringsEditor = ({
  value,
  onChange,
  onFocus,
  onBlur,
  mode,
  autofocus,
  shortcuts,
  minHeight,
  locale,
  examplePluralNum,
  nested,
  disabled,
}: EditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const placeholders = useRef<Compartment>(new Compartment());
  const isolates = useRef<Compartment>(new Compartment());
  const disabledCompartment = useRef<Compartment>(new Compartment());
  const keyBindings = useRef(shortcuts);
  const callbacksRef = useRefGroup({
    onChange,
    onFocus,
    onBlur,
  });
  const languageCompartment = useRef<Compartment>(new Compartment());

  keyBindings.current = shortcuts;

  useEffect(() => {
    const shortcutsUptoDate = shortcuts?.map((value, i) => {
      return {
        ...value,
        run: (val: EditorView) => keyBindings.current?.[i].run?.(val) ?? false,
      };
    });

    function completions(context: CompletionContext): CompletionResult | null {
      const word = context.matchBefore(/\w*/);
      if (!word || (word.from == word.to && !context.explicit)) {
        return null;
      }
      return {
        from: word.from,
        options: [
          {
            label: "page",
            type: "variable",
          },
          {
            label: "frame",
            type: "variable",
          },
          {
            label: "element",
            type: "variable",
          },
          {
            label: "component",
            type: "variable",
          },
          {
            label: "section",
            type: "variable",
          },
        ],
        commitCharacters: ["}"],
      };
    }

    const openAutocompleteOnBrace = EditorView.inputHandler.of(
      (view, from, to, text) => {
        if (text === "{") {
          startCompletion(view);
        }
        return false;
      }
    );

    const extensions = [
      minimalSetup,
      Prec.highest(keymap.of(shortcutsUptoDate ?? [])),
      EditorView.lineWrapping,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (v.focusChanged) {
          if (v.view.hasFocus) {
            callbacksRef.current?.onFocus?.();
          } else {
            callbacksRef.current?.onBlur?.();
          }
        }
        if (v.docChanged) {
          callbacksRef.current?.onChange?.(v.state.doc.toString());
        }
      }),
      EditorView.contentAttributes.of({
        spellcheck: "true",
        lang: locale || "",
      }),
      TolgeeHighlight(editorSyntaxColors),
      languageCompartment.current.of([]),
      placeholders.current.of([]),
      isolates.current.of([]),
      disabledCompartment.current.of([]),
    ];
    if (mode === "placeholders") {
      extensions.push(
        autocompletion({
          override: [completions],
          activateOnTyping: true,
          activateOnTypingDelay: 0,
        }),
        openAutocompleteOnBrace
      );
    }

    const instance = new EditorView({
      parent: ref.current!,
      state: EditorState.create({
        doc: value,
        extensions,
      }),
    });

    if (autofocus) {
      instance.focus();
    }

    editor.current = instance;
  }, []);

  useEffect(() => {
    const placholderPlugins =
      mode === "placeholders"
        ? [
            PlaceholderPlugin({
              examplePluralNum,
              nested: Boolean(nested),
              tooltips: false,
            }),
          ]
        : [];
    const syntaxPlugins =
      mode === "plain" ? [] : [tolgeeSyntax(Boolean(nested))];
    editor.current?.dispatch({
      selection: editor.current.state.selection,
      effects: [
        placeholders.current?.reconfigure(placholderPlugins),
        languageCompartment.current.reconfigure(syntaxPlugins),
      ],
    });
  }, [mode, nested, examplePluralNum]);

  useEffect(() => {
    const state = editor.current?.state;
    const editorValue = state?.doc.toString();
    if (state && editorValue !== value) {
      const transaction = state.update({
        changes: { from: 0, to: state.doc.length, insert: value || "" },
      });
      editor.current?.update([transaction]);
    }
  }, [value]);

  useEffect(() => {
    // set cursor to the end of document
    const length = editor.current!.state.doc.length;
    editor.current!.dispatch({ selection: { anchor: length } });

    return () => {
      editor.current!.destroy();
    };
  }, []);

  useEffect(() => {
    editor.current?.dispatch({
      effects: disabledCompartment.current.reconfigure(
        EditorState.readOnly.of(Boolean(disabled))
      ),
    });
  }, [disabled]);

  return (
    <div class="editor-wrapper">
      <div
        class="editor"
        data-cy="global-editor"
        ref={ref}
        style={{
          minHeight,
        }}
      />
    </div>
  );
};
