import { h, RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { minimalSetup } from "codemirror";
import {
  EditorSelection,
  EditorState,
  RangeSetBuilder,
  StateField,
} from "@codemirror/state";
import {
  ViewUpdate,
  EditorView,
  KeyBinding,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { getPlaceholders, Placeholder } from "@tginternal/editor";
import "!./StringsEditor.css";
import {
  autocompletion,
  Completion,
  CompletionContext,
  CompletionResult,
  pickedCompletion,
  startCompletion,
} from "@codemirror/autocomplete";

class PlaceholderBadgeWidget extends WidgetType {
  constructor(private value: Placeholder) {
    super();
  }

  eq(other: PlaceholderBadgeWidget) {
    return (
      other.value.name === this.value.name &&
      other.value.type === this.value.type &&
      other.value.error === this.value.error
    );
  }

  toDOM() {
    const outer = document.createElement("span");
    let classes = `placeholder-widget placeholder-${this.value.type}`;
    if (this.value.error) {
      classes += ` placeholder-error placeholder-error-${this.value.error}`;
    }
    outer.className = classes;
    const inner = document.createElement("span");
    inner.textContent = this.value.name;
    outer.appendChild(inner);
    return outer;
  }
}

// Renders {placeholder} ranges as badges. Replaces PlaceholderPlugin from
// @tginternal/editor, whose Decoration.widget({side: 1}) ranges place both
// boundary cursor positions inside the widget, so the caret is always drawn
// at the badge's left edge. Non-inclusive Decoration.replace keeps the
// positions before/after the badge, so the caret renders on the correct side.
function placeholderBadges() {
  const build = (state: EditorState) => {
    const builder = new RangeSetBuilder<Decoration>();
    let placeholders: Placeholder[] | null = [];
    try {
      placeholders = getPlaceholders(state.doc.toString(), true);
    } catch {
      placeholders = [];
    }
    for (const placeholder of placeholders ?? []) {
      builder.add(
        placeholder.position.start,
        placeholder.position.end,
        Decoration.replace({
          widget: new PlaceholderBadgeWidget(placeholder),
        }),
      );
    }
    return builder.finish();
  };
  const field = StateField.define<DecorationSet>({
    create: build,
    update: (set, transaction) =>
      transaction.docChanged ? build(transaction.state) : set,
    provide: (f) => [
      EditorView.decorations.from(f),
      EditorView.atomicRanges.of((view) => view.state.field(f)),
    ],
  });
  return field;
}

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
  const callbacksRef = useRefGroup({
    onChange,
    onFocus,
    onBlur,
  });

  function createCompletionOption(
    label: string,
    detail: string,
    insertText: string,
  ) {
    return {
      label,
      detail,
      type: "keyword" as const,
      apply(
        view: EditorView,
        completion: Completion,
        from: number,
        to: number,
      ) {
        view.dispatch({
          changes: { from, to, insert: insertText },
          selection: EditorSelection.cursor(from + insertText.length, -1),
          annotations: pickedCompletion.of(completion),
          scrollIntoView: true,
          userEvent: "input.complete",
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
          "{elementName}",
        ),
        createCompletionOption(
          "element text",
          "(displayed text of the string)",
          "{elementText}",
        ),
        createCompletionOption(
          "group",
          "(name of the nearest group)",
          "{group}",
        ),
        createCompletionOption(
          "component",
          "(name of the nearest component)",
          "{component}",
        ),
        createCompletionOption(
          "frame",
          "(name of the nearest frame)",
          "{frame}",
        ),
        createCompletionOption(
          "artboard",
          "(name of the artboard frame)",
          "{artboard}",
        ),
        createCompletionOption(
          "section",
          "(name of the nearest section)",
          "{section}",
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
      EditorView.domEventHandlers({
        click(_event, view) {
          startCompletion(view);
          return false;
        },
      }),
      placeholderBadges(),
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
