export const themes = ['system', 'dark', 'light'] as const;

export type Theme = (typeof themes)[number];
