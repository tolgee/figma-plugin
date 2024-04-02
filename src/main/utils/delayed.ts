export const delayed =
  <T>(promise: () => Promise<T>) =>
  () =>
    new Promise<T>((resolve, reject) =>
      setTimeout(() => promise().then(resolve).catch(reject))
    );
