import { emit, on, once } from "@/utilities";

export const createEndpoint = <I, O>(
  name: string,
  fn: ((input: I) => Promise<O>) | ((input: I) => O)
) => {
  let implementation = fn;
  const self = {
    register: () => {
      on(`${name}_IN`, async (data) => {
        const result = await implementation(data);
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
    mock: (fn: ((input: I) => Promise<O>) | ((input: I) => O)) => {
      implementation = fn;
      return self;
    },
    name,
  };
  return self;
};
