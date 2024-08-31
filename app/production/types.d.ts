import type { Item } from "~/types/items";
import type { SelfProduced } from "~/types/self_produced";

export type FullSelfProduced = SelfProduced & {
  item_title?: string;
};
export type ItemOption = Pick<Item, "id" | "title">;
