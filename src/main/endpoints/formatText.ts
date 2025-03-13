import { NodeInfo } from "../../types";
import { createEndpoint } from "../utils/createEndpoint";

export type FormatTextEndpointArgs = {
  /** The text that is to be displayed in the textNode. Can contain some basic html tags that will be replaced */
  formatted: string;
  nodeInfo: NodeInfo;
};

/**
 * Takes a node and the formatted (meaning parameters and plural values have been interpolated) text for this node
 * and replaces the text in the node with the formatted text. It also applies bold, italic and underline styles to the text
 */
export const formatText = async ({
  nodeInfo,
  formatted,
}: FormatTextEndpointArgs) => {
  const textNode = figma.getNodeById(nodeInfo.id) as TextNode;
  textNode.autoRename = false;

  const strippedAwayTags = ["strong", "b", "em", "i", "u"];

  const fontNames = textNode.getRangeAllFontNames(
    0,
    textNode.characters.length
  );

  for (const font of fontNames) {
    await figma.loadFontAsync(font);
    if (font.family) {
      await figma.loadFontAsync({ family: font.family, style: "Regular" });
    }
  }

  const breaks = /<br\s*\/?>\s*<\/br>|<br\s*\/?>|<\/br>/gi;

  const formattedWithoutBreaks = formatted.replace(breaks, "\n");

  const plainText = formatted.replace(/<[^>]*>/g, "");
  textNode.characters = plainText;

  const findRanges = (
    html: string,
    tag: string
  ): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = [];
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(html)) !== null) {
      let offset = 0;
      let tempString = html.substring(0, match.index);
      strippedAwayTags.forEach((tag) => {
        let regex = new RegExp(`</?${tag}>`, "g");
        let match;
        while ((match = regex.exec(tempString)) !== null) {
          offset += match[0].length;
          tempString = tempString.replace(match[0], "");
          regex = new RegExp(`</?${tag}>`, "g");
        }
      });

      const start = match.index - offset;
      const end = start + match[1].length;
      ranges.push({ start, end });
    }
    return ranges;
  };

  const applyStyles = async (
    ranges: { start: number; end: number }[],
    style: Partial<Paint & FontName>,
    decoration?: TextDecoration
  ) => {
    for (const range of ranges) {
      if (
        range.start >= range.end ||
        range.end > textNode.characters.length - 1
      ) {
        continue;
      }
      if (style.family && style.style) {
        textNode.setRangeFontName(range.start, range.end, {
          family: style.family,
          style: style.style,
        });
      }
      if (decoration) {
        textNode.setRangeTextDecoration(range.start, range.end, decoration);
      }
    }
  };

  const boldRanges = [
    ...findRanges(formattedWithoutBreaks, "strong"),
    ...findRanges(formattedWithoutBreaks, "b"),
  ];
  const italicRanges = [
    ...findRanges(formattedWithoutBreaks, "em"),
    ...findRanges(formattedWithoutBreaks, "i"),
  ];
  const underlineRanges = findRanges(formattedWithoutBreaks, "u");

  // Apply a type of default font to the whole text. Needs to be done before applying bold/italic styles and by
  // character to avoid issues with different fonts in the same text node
  for (let i = 0; i <= textNode.characters.length; i++) {
    applyStyles([{ start: i, end: i + 1 }], {
      family: fontNames[0].family,
      style: fontNames.find((f) => f.style !== "Bold")?.style ?? "Regular",
    });
  }

  for (const range of boldRanges) {
    const font = textNode.getRangeFontName(
      range.start,
      Math.min(textNode.characters.length, range.end)
    ) as FontName;
    if (font.family) {
      await figma.loadFontAsync({ family: font.family, style: "Bold" });
      await applyStyles([range], { family: font.family, style: "Bold" });
    }
  }

  for (const range of italicRanges) {
    const font = textNode.getRangeFontName(
      range.start,
      Math.min(textNode.characters.length, range.end)
    ) as FontName;
    if (font.family) {
      await figma.loadFontAsync({ family: font.family, style: "Italic" });
      await applyStyles([range], { family: font.family, style: "Italic" });
    }
  }

  for (const range of underlineRanges) {
    await applyStyles([range], {}, "UNDERLINE");
  }
};

export const formatTextEndpoint = createEndpoint<FormatTextEndpointArgs, void>(
  "UPDATE_NODE_TEXT",
  async (args) => await formatText(args)
);
