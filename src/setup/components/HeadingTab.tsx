import { h } from "preact";

type Props = {
  name: string;
  route: string;
  currentRoute: string;
  onChange: (route: string) => void;
};

export const HeadingTab = ({ name, route, currentRoute, onChange }: Props) => {
  return (
    <div
      style={{ color: route === currentRoute ? "white" : "lightgrey" }}
      onClick={() => onChange(route)}
    >
      {name}
    </div>
  );
};
