import { NodeInfo } from "../../types";
import { createEndpoint } from "../utils/createEndpoint";

export type FormatTextEndpointArgs = {
  /** The text that is to be displayed in the textNode. Can contain some basic html tags that will be replaced */
  formatted: string;
  nodeInfo: NodeInfo;
};

const mapWightToStyle: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
  1000: "Heavy",
  1100: "Extra Black",
  1200: "Ultra Black",
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

  const weights = textNode.getRangeFontWeight(0, textNode.characters.length);

  let singleWeight = true;

  if (typeof weights === "number") {
    singleWeight = true;
  }

  for (const font of fontNames) {
    await figma.loadFontAsync(font);
    if (font.family) {
      await figma.loadFontAsync({ family: font.family, style: "Regular" });
    }
  }

  const breaks = /<br\s*\/?>\s*<\/br>|<br\s*\/?>|<\/br>/gi;

  const formattedWithoutBreaks = formatted.replace(breaks, "\n");

  const plainText = formattedWithoutBreaks.replace(/<[^>]*>/g, "");
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
    style: Partial<Paint & FontName> | undefined,
    decoration?: TextDecoration
  ) => {
    for (const range of ranges) {
      if (range.start > range.end) {
        continue;
      }
      if (style && style.family && style.style) {
        textNode.setRangeFontName(
          range.start,
          Math.min(textNode.characters.length, range.end),
          {
            family: style.family,
            style: style.style,
          }
        );
      }
      if (decoration) {
        textNode.setRangeTextDecoration(
          range.start,
          Math.min(textNode.characters.length, range.end),
          decoration
        );
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

  const defaultRanges: { start: number; end: number }[] = [];

  // Track continuous ranges of default text
  let currentRange: { start: number; end: number } | null = null;

  const formattedRanges = [...boldRanges, ...italicRanges];
  for (let i = 0; i < textNode.characters.length; i++) {
    const isBoldOrItalic = formattedRanges.some(
      (range) => i >= range.start && i <= range.end
    );

    if (!isBoldOrItalic) {
      if (currentRange === null) {
        currentRange = { start: i, end: i + 1 };
      } else {
        currentRange.end = i + 1;
      }
    } else if (currentRange) {
      defaultRanges.push(currentRange);
      currentRange = null;
    }
  }

  if (currentRange) {
    defaultRanges.push(currentRange);
  }

  if (defaultRanges.length > 0) {
    const font = textNode.getRangeFontName(
      defaultRanges[0].start,
      defaultRanges[0].end
    ) as FontName;

    if (font.family) {
      await figma.loadFontAsync({
        family: font.family,
        style: singleWeight ? mapWightToStyle[weights as number] : "Regular",
      });
      await applyStyles(defaultRanges, {
        family: font.family,
        style: singleWeight ? mapWightToStyle[weights as number] : "Regular",
      });
    }
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
    await applyStyles([range], undefined, "UNDERLINE");
  }
};

export const formatTextEndpoint = createEndpoint<FormatTextEndpointArgs, void>(
  "UPDATE_NODE_TEXT",
  async (args) => await formatText(args)
);
