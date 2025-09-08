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

  function createCompletionOption(
    label: string,
    detail: string,
    insertText: string
  ) {
    return {
      label,
      detail,
      type: "keyword" as const,
      apply(view: EditorView, _: any, from: number, to: number) {
        const insert = insertText;
        view.dispatch({
          changes: { from, to, insert },
          selection: { anchor: from + insert.length },
        });
      },
    };
  }

  function completions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/[A-Za-z0-9]*/);
    if (!word || (word.from == word.to && !context.explicit)) {
      return null;
    }
    return {
      from: word.from,
      options: [
        createCompletionOption(
          "element name",
          "(name of the string)",
          "{elementName}"
        ),
        createCompletionOption(
          "element text",
          "(displayed text of the string)",
          "{elementText}"
        ),
        createCompletionOption(
          "group",
          "(name of the nearest group)",
          "{group}"
        ),
        createCompletionOption(
          "component",
          "(name of the nearest component)",
          "{component}"
        ),
        createCompletionOption(
          "frame",
          "(name of the nearest frame)",
          "{frame}"
        ),
        createCompletionOption(
          "artboard",
          "(name of the artboard frame)",
          "{artboard}"
        ),
        createCompletionOption(
          "section",
          "(name of the nearest section)",
          "{section}"
        ),
      ],
      commitCharacters: ["}"],
    };
  }

  useEffect(() => {
    if (!ref.current) return;

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
    // set cursor to the end of document
    const length = editor.current!.state.doc.length;
    editor.current!.dispatch({ selection: { anchor: length } });

    return () => {
      if (editor.current) {
        editor.current.destroy();
        editor.current = undefined;
      }
    };
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
