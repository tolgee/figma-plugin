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

  const getFontsOfFamily = async (font: FontName) =>
    (await figma.listAvailableFontsAsync()).filter(
      (f) => f.fontName.family === font.family
    );

  const findBestBoldStyle = async (
    family: string,
    availableFonts: Font[]
  ): Promise<string | null> => {
    /** Some common names for bold styles */
    const boldStyles = [
      "Bold",
      "Semibold",
      "Semi Bold",
      "Medium",
      "Extra Bold",
      "Heavy",
      "Black",
      "Ultra Bold",
    ];

    for (const style of boldStyles) {
      const fontExists = availableFonts.some(
        (font) =>
          font.fontName.family === family && font.fontName.style === style
      );
      if (fontExists) {
        try {
          await figma.loadFontAsync({ family, style });
          return style;
        } catch (error) {
          continue;
        }
      }
    }

    /** First font where "bold" is included */
    const fallbackFont = availableFonts.find((f) =>
      f.fontName.style.toLowerCase().includes("bold")
    );

    if (fallbackFont) {
      try {
        await figma.loadFontAsync(fallbackFont.fontName);
        return fallbackFont.fontName.style;
      } catch (error) {
        console.error(`Failed to load fallback font: ${error}`);
      }
    }
    return null;
  };

  const findBestItalicStyle = async (
    family: string,
    availableFonts: Font[]
  ): Promise<string | null> => {
    /** List of common italic styles */
    const italicStyles = [
      "Italic",
      "Regular Italic",
      "Medium Italic",
      "Light Italic",
      "Semi Bold Italic",
      "Semibold Italic",
      "Bold Italic",
      "Oblique",
      "Regular Oblique",
    ];

    for (const style of italicStyles) {
      const fontExists = availableFonts.some(
        (font) =>
          font.fontName.family === family && font.fontName.style === style
      );
      if (fontExists) {
        try {
          await figma.loadFontAsync({ family, style });
          return style;
        } catch (error) {
          continue;
        }
      }
    }

    /** First font with italic/oblique in it's name */
    const fallbackFont = availableFonts.find(
      (f) =>
        f.fontName.style.toLowerCase().includes("italic") ||
        f.fontName.style.toLowerCase().includes("oblique")
    );

    if (fallbackFont) {
      try {
        await figma.loadFontAsync(fallbackFont.fontName);
        return fallbackFont.fontName.style;
      } catch (error) {
        console.error(`Failed to load fallback font: ${error}`);
      }
    }
    return null;
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
        style: font.style,
      });
      await applyStyles(defaultRanges, {
        family: font.family,
        style: font.style,
      });
    }
  }
  for (const range of boldRanges) {
    const font = textNode.getRangeFontName(
      range.start,
      Math.min(textNode.characters.length, range.end)
    ) as FontName;

    if (font.family) {
      const availableFonts = await getFontsOfFamily(font);
      const boldStyle = await findBestBoldStyle(font.family, availableFonts);

      if (boldStyle) {
        await applyStyles([range], { family: font.family, style: boldStyle });
      } else {
        // Fallback to original style if no bold variant found
        await figma.loadFontAsync({ family: font.family, style: font.style });
        await applyStyles([range], { family: font.family, style: font.style });
      }
    }
  }

  for (const range of italicRanges) {
    const font = textNode.getRangeFontName(
      range.start,
      Math.min(textNode.characters.length, range.end)
    ) as FontName;

    if (font.family) {
      const availableFonts = await getFontsOfFamily(font);
      const italicStyle = await findBestItalicStyle(
        font.family,
        availableFonts
      );

      if (italicStyle) {
        await applyStyles([range], { family: font.family, style: italicStyle });
      } else {
        // Fallback to original style if no italic variant found
        await figma.loadFontAsync({ family: font.family, style: font.style });
        await applyStyles([range], { family: font.family, style: font.style });
      }
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
