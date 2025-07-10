import { h, RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { ViewUpdate, EditorView, KeyBinding } from "@codemirror/view";
import { PlaceholderPlugin } from "@tginternal/editor";
import "!./StringsEditor.css";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete";

export type EditorProps = {
  value: string;
  onChange?: (val: string) => void;
  background?: string;
  autofocus?: boolean;
  minHeight?: number | string;
  onBlur?: () => void;
  onFocus?: () => void;
  shortcuts?: KeyBinding[];
  autoScrollIntoView?: boolean;
  locale?: string;
  examplePluralNum?: number;
  nested?: boolean;
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
  minHeight,
}: EditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const placeholders = useRef<Compartment>(new Compartment());
  const callbacksRef = useRefGroup({
    onChange,
    onFocus,
    onBlur,
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
          detail: "(nearest page)",
          type: "keyword",
          apply(view, completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{page}" },
            });
          },
        },
        {
          label: "frame",
          detail: "(nearest frame)",
          type: "keyword",
          apply(view, completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{frame}" },
            });
          },
        },
        {
          label: "element",
          detail: "(nearest frame/component/section)",
          type: "keyword",
          apply(view, completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{element}" },
            });
          },
        },
        {
          label: "component",
          detail: "(nearest component)",
          type: "keyword",
          apply(view, completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{component}" },
            });
          },
        },
        {
          label: "section",
          detail: "(nearest section)",
          type: "keyword",
          apply(view, completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{section}" },
            });
          },
        },
      ],
      commitCharacters: ["}"],
    };
  }

  useEffect(() => {
    const extensions = [
      minimalSetup,
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
      placeholders.current.of(
        PlaceholderPlugin({
          examplePluralNum: 1,
          nested: true,
          tooltips: false,
        })
      ),
      autocompletion({
        override: [completions],
        aboveCursor: true,
        icons: false,
      }),
    ];

    const instance = new EditorView({
      parent: ref.current!,
      state: EditorState.create({
        doc: value,
        extensions,
      }),
    });

    editor.current = instance;
  }, []);

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

  return (
    <div class="editor-wrapper">
      <div
        onClick={() => {
          startCompletion(editor.current!);
        }}
        class="strings-editor"
        data-cy="global-editor"
        ref={ref}
        style={{
          minHeight,
        }}
      />
    </div>
  );
};
