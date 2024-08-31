export type Sort = {
  column: string;
  direction: "asc" | "desc";
};

export type Cache = { key: string; maxAge: number; swr: boolean };
