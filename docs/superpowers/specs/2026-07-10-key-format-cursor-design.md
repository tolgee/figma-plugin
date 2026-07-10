# Key format cursor fix

## Problem

The key-format editor starts completion on every `keydown`, before CodeMirror
has applied the typed character. Its custom completion transaction also bypasses
CodeMirror's built-in completion lifecycle. After inserting a placeholder, the
next separator or placeholder can therefore use a stale completion range and
move the cursor unexpectedly.

After accepting a placeholder, the logical cursor position is correct, but the
caret is rendered on the left side of the placeholder badge. The same visual
position is shown when the cursor is logically before or after the badge.

## Design

- Keep click-to-open completion.
- Remove the editor wrapper's `onKeyDown` completion trigger. CodeMirror already
  activates completion for normal typing.
- Represent each placeholder's `apply` value as the inserted string so CodeMirror
  owns the document change, selection mapping, and completion closing.
- Do not change placeholder names, formatting, preview generation, or persistence.

### Placeholder caret association

The placeholder is rendered as a CodeMirror widget with `side: 1`. CodeMirror
uses a cursor range's `assoc` value to choose the visual side at an ambiguous
widget boundary. A completion currently leaves `assoc` at its default value, so
the caret is drawn on the badge's left edge even though the cursor is logically
after it.

Apply placeholder completions with a cursor range whose `assoc` is `-1`. This
associates the cursor with the preceding content and renders it on the right
edge of the badge. Preserve CodeMirror's `pickedCompletion` annotation so its
completion lifecycle and events continue to behave normally.

Arrow-key movement remains owned by CodeMirror. Consider a local cursor overlay
only if the regression test shows that CodeMirror does not preserve the correct
association while crossing the atomic placeholder.

## Verification

Add a Cypress regression that opens the key-format editor, inserts a placeholder,
types `.` at the cursor, inserts another placeholder, and verifies the separator
remains between the two placeholders. Run the focused test first to prove the
current implementation fails, then run it again after the fix together with the
TypeScript and build checks.

Also assert the primary caret's position relative to the placeholder badge:

- directly after accepting a placeholder, the caret is at the badge's right edge;
- after moving left across the placeholder, the caret is at its left edge;
- after moving right across the placeholder, the caret is again at its right edge.
