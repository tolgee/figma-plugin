/**
 * Replaces newlines and html tags so that the text of a figma node can be compared to a translation.
 */
export const stringFormatter = (
  str: string,
  args: {
    replaceHtmlTags: boolean;
    replaceNewlines: boolean;
  } = {
    replaceHtmlTags: true,
    replaceNewlines: true,
  }
) => {
  let newString = str;
  if (args.replaceHtmlTags) {
    newString = newString.replace(/<[^>]*>/g, "");
  }
  if (args.replaceNewlines) {
    newString = newString.replace(/\u2028|\u8233/g, "\n\n");
  }
  return newString;
};
