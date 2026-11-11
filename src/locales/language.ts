// Picks the game language once, at load. Changing it reloads the page.
export const LANGUAGES = ["en", "pl"] as const;
export type Language = (typeof LANGUAGES)[number];

/** The localStorage key that holds the player's language pick. */
export const LANGUAGE_KEY = "biooro.language";

function known(value: string | null | undefined): Language | null {
  const short = value?.slice(0, 2).toLowerCase();
  return LANGUAGES.find((language) => language === short) ?? null;
}

/** A `?lang=` query wins, then the saved pick, then the browser's first known language, then English. */
export function pickLanguage(query: string, saved: string | null, browser: readonly string[]): Language {
  const fromQuery = known(new URLSearchParams(query).get("lang"));
  if (fromQuery) return fromQuery;
  const fromSave = known(saved);
  if (fromSave) return fromSave;
  for (const preferred of browser) {
    const language = known(preferred);
    if (language) return language;
  }
  return "en";
}

function readSaved(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

/** The game language. Outside a browser, such as in tests, it is always English. */
export const LANGUAGE: Language =
  typeof window === "undefined" ? "en" : pickLanguage(window.location.search, readSaved(), navigator.languages);
