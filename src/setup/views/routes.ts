import { WindowSize } from "@/types";

export type Route =
  | ["index"]
  | ["settings"]
  | ["connect", { id: string; initialKey: string }];

export type RouteKey = Route[0];

export type RouteParam<T extends Route[0]> = Extract<Route, [T, any]>[1];

const DEFAULT_SIZE = { width: 500, height: 400 };

export const SIZES = {
  settings: { width: 300, height: 500 },
};

export const getWindowSize = (routeKey: RouteKey): WindowSize => {
  return (SIZES as any)[routeKey] || DEFAULT_SIZE;
};
