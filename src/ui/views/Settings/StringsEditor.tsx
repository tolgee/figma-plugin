import { h, RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { minimalSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import {
  ViewUpdate,
  EditorView,
  KeyBinding,
  Decoration,
  WidgetType,
} from "@codemirror/view";
import { PlaceholderPlugin } from "@tginternal/editor";
import "!./StringsEditor.css";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete";

// Custom placeholder widget
class PlaceholderWidget extends WidgetType {
  constructor(private placeholder: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.placeholder;
    span.className = "cm-placeholder";
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

// Custom placeholder extension
function placeholderExtension(placeholder: string) {
  return EditorView.decorations.compute(["doc"], (state) => {
    const doc = state.doc;
    if (doc.length > 0) {
      return Decoration.none;
    }

    const decoration = Decoration.widget({
      widget: new PlaceholderWidget(placeholder),
      side: 1,
    });

    return Decoration.set([decoration.range(0)]);
  });
}

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
    const word = context.matchBefore(/[A-Za-z0-9]*/);
    if (!word || (word.from == word.to && !context.explicit)) {
      return null;
    }
    return {
      from: word.from,
      options: [
        {
          label: "element name",
          detail: "(name of the string)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{elementName}" },
            });
          },
        },
        {
          label: "element text",
          detail: "(displayed text of the string)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{elementText}" },
            });
          },
        },
        {
          label: "group",
          detail: "(nearest group)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{group}" },
            });
          },
        },
        {
          label: "component",
          detail: "(nearest component)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{component}" },
            });
          },
        },
        {
          label: "frame",
          detail: "(nearest frame)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{frame}" },
            });
          },
        },
        {
          label: "artboard",
          detail: "(artboard frame)",
          type: "keyword",
          apply(view, _, from, to) {
            view.dispatch({
              changes: { from, to, insert: "{artboard}" },
            });
          },
        },
        {
          label: "section",
          detail: "(nearest section)",
          type: "keyword",
          apply(view, _, from, to) {
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
        optionClass: () => {
          return "tolgee-completion-option";
        },
        aboveCursor: true,
        icons: false,
      }),
      placeholderExtension("artboard.element"),
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
        placeholder="artboard.element"
        onClick={() => {
          startCompletion(editor.current!);
        }}
        onKeyDown={() => {
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
