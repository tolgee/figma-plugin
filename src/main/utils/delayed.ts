export const delayed =
  <T, P>(promise: (props: P) => Promise<T>) =>
  (props: P) =>
    new Promise<T>((resolve, reject) =>
      setTimeout(() => promise(props).then(resolve).catch(reject), 10)
    );
