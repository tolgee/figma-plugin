import { Textbox } from "@create-figma-plugin/ui";
import { h } from "preact";
import { useState } from "preact/hooks";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  initialValue: string;
  onDebouncedChange: (value: string) => void;
};

export const KeyInput = ({ initialValue, onDebouncedChange }: Props) => {
  const [value, setValue] = useState(initialValue);

  const debouncedcallback = useDebouncedCallback(
    (value: string) => onDebouncedChange(value),
    1000
  );

  return (
    <Textbox
      data-cy="index_unconnected_key_input"
      placeholder="Key name"
      value={value}
      onChange={(e) => {
        setValue(e.currentTarget.value);
        debouncedcallback(e.currentTarget.value);
      }}
      variant="border"
      style={{
        fontSize: 12,
        height: 23,
      }}
    />
  );
};
