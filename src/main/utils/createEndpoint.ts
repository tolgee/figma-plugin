import { emit, on, once } from "@/utilities";

export const createEndpoint = <I, O>(
  name: string,
  fn: ((input: I) => Promise<O>) | ((input: I) => O)
) => {
  let endpointRequestCounter = 0;
  let implementation = fn;
  const self = {
    register: () => {
      on(`${name}_IN`, async (data) => {
        const result = await implementation(data);
        emit(`${name}_${data._requestId}_OUT`, result);
      });
    },
    call: (input: I) => {
      const _requestId = endpointRequestCounter++;
      const result = new Promise<O>((resolve) => {
        once(`${name}_${_requestId}_OUT`, resolve);
      });
      emit(`${name}_IN`, { ...input, _requestId });
      return result;
    },
    mock: (fn: ((input: I) => Promise<O>) | ((input: I) => O)) => {
      implementation = fn;
      self.register();
      return self;
    },
    name,
  };
  return self;
};
