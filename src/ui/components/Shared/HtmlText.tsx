import { h } from "preact";
import DOMPurify from "dompurify";
import { CSSProperties } from "preact/compat";

interface HtmlTextProps {
  text?: string;
  style: CSSProperties | string | undefined;
  dataCy?: string;
}

export const HtmlText = (props: HtmlTextProps) => {
  return (
    <span
      data-cy={props.dataCy}
      style={props.style}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(props.text ?? ""),
      }}
    />
  );
};
