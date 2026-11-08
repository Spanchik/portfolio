import type { Locale } from "./config";
import { uk } from "./dictionaries/uk";
import { en } from "./dictionaries/en";

const dictionaries = { uk, en } as const;

export const getDictionary = (locale: Locale) => dictionaries[locale];
