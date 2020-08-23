export type ErrorLike = Readonly<{
  colNo?: string | number;
  lineNo?: string | number;
  fileName?: string;
  message?: string;
  stack?: string[];
  path?: string;
}>
