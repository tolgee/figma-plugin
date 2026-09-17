import { describe, expect, it } from "vitest";
import { sanitizeIcuPreview } from "$ui/lib/logic/sanitizeIcuPreview";

describe("sanitizeIcuPreview", () => {
  it("neutralizes an <img onerror=...> XSS payload", () => {
    const out = sanitizeIcuPreview("<img src=x onerror=alert(1)>");
    expect(out).not.toContain("<img");
  });

  it("keeps <b>bold</b> as a real tag", () => {
    expect(sanitizeIcuPreview("<b>bold</b>")).toBe("<b>bold</b>");
  });

  it("keeps <i>...</i> as a real tag", () => {
    expect(sanitizeIcuPreview("<i>italic</i>")).toBe("<i>italic</i>");
  });

  it("keeps <em>...</em> as a real tag", () => {
    expect(sanitizeIcuPreview("<em>emphasis</em>")).toBe("<em>emphasis</em>");
  });

  it("keeps <u>...</u> as a real tag", () => {
    expect(sanitizeIcuPreview("<u>underline</u>")).toBe("<u>underline</u>");
  });

  it("keeps <strong>...</strong> as a real tag", () => {
    expect(sanitizeIcuPreview("<strong>strong</strong>")).toBe("<strong>strong</strong>");
  });

  it("keeps <br> as a real self-closing tag", () => {
    expect(sanitizeIcuPreview("line1<br>line2")).toBe("line1<br>line2");
  });

  it("keeps <br/> as a real self-closing tag", () => {
    expect(sanitizeIcuPreview("line1<br/>line2")).toBe("line1<br/>line2");
  });

  it("strips the attribute off a whitelisted tag rather than letting it through live", () => {
    const out = sanitizeIcuPreview('<b onclick="alert(1)">bold</b>');
    // The attribute must never appear as a live attribute — it's fine if it
    // shows up as escaped, inert text, but `onclick=` must not survive as a
    // real DOM attribute assignment.
    expect(out).not.toContain('onclick="alert(1)"');
    expect(out).not.toMatch(/<b[^>]*onclick/);
  });

  it("renders plain literal < and > that don't form a recognized tag as escaped text", () => {
    const out = sanitizeIcuPreview("if a < b then > c");
    expect(out).toBe("if a &lt; b then &gt; c");
    expect(out).not.toContain("<b ");
  });

  it("preserves nested/mixed whitelisted tags", () => {
    const out = sanitizeIcuPreview("<b>bold <i>and italic</i></b>");
    expect(out).toBe("<b>bold <i>and italic</i></b>");
  });

  it("neutralizes an unknown tag like <script>", () => {
    const out = sanitizeIcuPreview("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("</script>");
  });

  it("neutralizes an unknown tag like <a href=...>", () => {
    const out = sanitizeIcuPreview('<a href="x">link</a>');
    expect(out).not.toContain("<a ");
    expect(out).not.toContain("</a>");
  });
});
