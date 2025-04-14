import { NodeInfo } from "@/types";

export type Route =
  | ["index"]
  | ["settings"]
  | ["push"]
  | ["string_details"]
  | ["pull", { lang: string }]
  | ["connect", { node: NodeInfo }]
  | ["create_copy"];

export type RouteKey = Route[0];

export type RouteParam<T extends Route[0]> = Extract<Route, [T, any]>[1];
