const DEFAULT_SIZE = { width: 300, height: 400 };

export const PAGES = {
  index: DEFAULT_SIZE,
  settings: { width: 300, height: 500 },
};

export type Route = keyof typeof PAGES;
