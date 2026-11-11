// The shape a translated table must match: the English table's keys, with any text in place of each string.
export type Strings<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly string[]
      ? readonly string[]
      : { readonly [K in keyof T]: Strings<T[K]> };
