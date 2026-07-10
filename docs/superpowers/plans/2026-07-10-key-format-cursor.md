# Key Format Cursor Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep separators and the cursor at the intended position when users combine multiple placeholders in the key-format editor.

**Architecture:** Let CodeMirror own completion insertion, selection mapping, and completion closing. Open completion from a CodeMirror content click handler instead of restarting it from every bubbled click and keydown event.

**Tech Stack:** TypeScript, Preact, CodeMirror 6, Cypress, Bun

## Global Constraints

- Keep click-to-open completion.
- Do not change placeholder names, formatting, preview generation, or persistence.
- Add no dependencies or new abstractions.
- Use Bun for project commands.

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
