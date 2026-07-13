# Key Format Cursor Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep separators and the cursor at the intended position when users combine multiple placeholders in the key-format editor.

**Architecture:** Use CodeMirror's completion lifecycle and content click handler
instead of restarting completion from bubbled events. The visual-caret follow-up
customizes only the completion transaction's cursor association so CodeMirror
draws the caret on the logical side of an atomic placeholder.

**Tech Stack:** TypeScript, Preact, CodeMirror 6, Cypress, Bun

## Global Constraints

- Keep click-to-open completion.
- Do not change placeholder names, formatting, preview generation, or persistence.
- Add no dependencies or new abstractions.
- Use Bun for project commands.
- Do not add or run Cypress coverage for the visual-caret follow-up; the reporter
  will verify it manually.

---

### Task 1: Preserve the cursor between key-format placeholders

**Files:**

- Create: `cypress/e2e/keyFormatEditor.cy.ts`
- Modify: `src/ui/views/Settings/StringsEditor.tsx:93-108,163-193,227-242`

**Interfaces:**

- Consumes: CodeMirror `Completion.apply`, `EditorView.domEventHandlers`, and the existing `StringsEditor` props.
- Produces: unchanged `StringsEditor` props and unchanged key-format strings through `onChange`.

- [x] **Step 1: Write the failing Cypress regression**

```typescript
import { DEFAULT_CREDENTIALS } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Key format editor", () => {
  it("keeps separators between inserted placeholders", () => {
    visitWithState({
      config: {
        apiUrl: DEFAULT_CREDENTIALS.apiUrl,
        apiKey: DEFAULT_CREDENTIALS.apiKey,
        language: "en",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
        prefillKeyFormat: true,
        keyFormat: "",
      },
    });

    cy.iframe().findDcy("index_settings_button").click();
    cy.iframe().findDcy("settings_expandable_strings").click();
    cy.iframe().findDcy("global-editor").click();
    cy.iframe().find(".cm-content").as("editorContent");
    cy.iframe().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);

    cy.get("@editorContent").type("{enter}").should("have.text", "artboard");
    cy.iframe().find(".cm-tooltip-autocomplete").should("not.exist");
    cy.get("@editorContent").type(".component");
    cy.iframe().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);
    cy.get("@editorContent")
      .type("{enter}")
      .should("have.text", "artboard.component");
    cy.iframe().find(".cm-tooltip-autocomplete").should("not.exist");
  });
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
bunx cypress run --spec cypress/e2e/keyFormatEditor.cy.ts
```

Expected: FAIL because `.cm-tooltip-autocomplete` still exists after accepting the first placeholder, demonstrating that completion was restarted by the wrapper event.

- [x] **Step 3: Delegate insertion and click handling to CodeMirror**

Replace `createCompletionOption` with CodeMirror's string `apply` contract:

```typescript
function createCompletionOption(
  label: string,
  detail: string,
  insertText: string,
) {
  return {
    label,
    detail,
    type: "keyword" as const,
    apply: insertText,
  };
}
```

Add a content-scoped click handler to the editor extensions:

```typescript
EditorView.domEventHandlers({
  click(_event, view) {
    startCompletion(view);
    return false;
  },
}),
```

Remove the Preact `onClick` and `onKeyDown` props from the editor wrapper. This prevents completion-option clicks and ordinary key presses from starting a stale explicit completion.

- [x] **Step 4: Run focused and static verification**

Run:

```bash
bunx cypress run --spec cypress/e2e/keyFormatEditor.cy.ts
bun run tsc
bun run build
```

Expected: the Cypress spec passes, TypeScript reports no errors, and the plugin build completes successfully.

- [x] **Step 5: Commit the bug fix**

```bash
git add cypress/e2e/keyFormatEditor.cy.ts src/ui/views/Settings/StringsEditor.tsx docs/superpowers/plans/2026-07-10-key-format-cursor.md
git commit -m "fix(settings): preserve key format cursor position"
```

### Task 2: Render the caret on the logical side of a placeholder

**Files:**

- Modify: `src/ui/views/Settings/StringsEditor.tsx:3,16-21,93-106`
- Modify: `docs/superpowers/specs/2026-07-10-key-format-cursor-design.md:37-53`

**Interfaces:**

- Consumes: CodeMirror `Completion`, `EditorSelection.cursor`,
  `pickedCompletion`, and the existing placeholder completion range.
- Produces: the existing completion option shape with a custom `apply` function
  that places the cursor at `from + insertText.length` with `assoc: -1`.

- [x] **Step 1: Apply the completion with an explicit cursor association**

Import the selection and completion APIs:

```typescript
import { Compartment, EditorSelection, EditorState } from "@codemirror/state";
import {
  autocompletion,
  Completion,
  CompletionContext,
  CompletionResult,
  pickedCompletion,
  startCompletion,
} from "@codemirror/autocomplete";
```

Replace the string `apply` value in `createCompletionOption` with a typed
function that preserves CodeMirror's completion annotation:

```typescript
apply(view: EditorView, completion: Completion, from: number, to: number) {
  view.dispatch({
    changes: { from, to, insert: insertText },
    selection: EditorSelection.cursor(from + insertText.length, -1),
    annotations: pickedCompletion.of(completion),
    scrollIntoView: true,
    userEvent: "input.complete",
  });
},
```

- [x] **Step 2: Run static verification**

Run:

```bash
bun run tsc
bun run build
```

Expected: TypeScript reports no errors and the plugin build completes
successfully. Do not run Cypress; the reporter will verify left/right caret
rendering in Figma.

- [x] **Step 3: Commit the follow-up fix**

```bash
git add src/ui/views/Settings/StringsEditor.tsx \
  docs/superpowers/specs/2026-07-10-key-format-cursor-design.md \
  docs/superpowers/plans/2026-07-10-key-format-cursor.md
git commit -m "fix(settings): render cursor after placeholder badge"
```
