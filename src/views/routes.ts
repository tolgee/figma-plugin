import { NodeInfo } from "@/types";

export type Route =
  | ["index"]
  | ["settings"]
  | ["push", { nodes: NodeInfo[] }]
  | ["pull", { nodes?: NodeInfo[]; lang: string }]
  | ["connect", { node: NodeInfo }];

export type RouteKey = Route[0];

export type RouteParam<T extends Route[0]> = Extract<Route, [T, any]>[1];

export const DEFAULT_SIZE = { width: 500, height: 400 };
