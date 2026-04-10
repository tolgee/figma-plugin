import { Textbox } from "@create-figma-plugin/ui";
import { h } from "preact";
import { memo } from "preact/compat";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const KeyInput = memo(({ value, onChange }: Props) => {
  return (
    <Textbox
      data-cy="index_unconnected_key_input"
      placeholder="Key name"
      value={value}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
      variant="border"
      style={{
        fontSize: 12,
        height: 23,
      }}
    />
  );
});
