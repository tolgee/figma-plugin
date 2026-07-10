# Key format cursor fix

## Problem

The key-format editor starts completion on every `keydown`, before CodeMirror
has applied the typed character. Its custom completion transaction also bypasses
CodeMirror's built-in completion lifecycle. After inserting a placeholder, the
next separator or placeholder can therefore use a stale completion range and
move the cursor unexpectedly.

## Design

- Keep click-to-open completion.
- Remove the editor wrapper's `onKeyDown` completion trigger. CodeMirror already
  activates completion for normal typing.
- Represent each placeholder's `apply` value as the inserted string so CodeMirror
  owns the document change, selection mapping, and completion closing.
- Do not change placeholder names, formatting, preview generation, or persistence.

## Verification

Add a Cypress regression that opens the key-format editor, inserts a placeholder,
types `.` at the cursor, inserts another placeholder, and verifies the separator
remains between the two placeholders. Run the focused test first to prove the
current implementation fails, then run it again after the fix together with the
TypeScript and build checks.
