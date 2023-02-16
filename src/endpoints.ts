import { emit, on, once } from "@/utilities";
import { FrameScreenshot, NodeInfo } from "./types";

export const createEndpoint = <I, O>(name: string) => {
  return {
    implement: (fn: ((input: I) => O) | ((input: I) => Promise<O>)) => {
      on(`${name}_IN`, async (data) => {
        const result = await fn(data);
        emit(`${name}_OUT`, result);
      });
    },
    call: (input: I) => {
      const result = new Promise<O>((resolve) => {
        once(`${name}_OUT`, resolve);
      });
      emit(`${name}_IN`, input);
      return result;
    },
  };
};

export const endpointGetScreenshots = createEndpoint<
  NodeInfo[],
  FrameScreenshot[]
>("GET_SCREENSHOTS");
