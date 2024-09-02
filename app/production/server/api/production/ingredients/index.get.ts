import type { ItemInfo } from "~/production/types";
import type { Ingredient } from "~/types/ingredients";
import { snapshot } from "unstorage";
import Ingredients from "~/production/components/ingredients.vue";

export default defineEventHandler(async (event) => {
  const selfProducedItemId = getQuery(event).id as string;
  const ings: (Ingredient & { info: ItemInfo })[] = await usePocketbase()
    .collection("ingredients")
    .getFullList({
      filter: usePocketbase().filter(
        "self_produced_item = {:selfProducedItemId}",
        { selfProducedItemId: selfProducedItemId }
      ),
    });
  const itemInfo: ItemInfo[] = await $fetch("/api/production/item_info");
  // return ings.map(async(i)=>({
  //   id: i.id,
  //   ingredient:i.ingredient
  // }));
  const res = ings.map((i) => ({
    id: i.id,
    ingredient: i.ingredient,
    quantity: i.quantity,
    substitutes: i.substitutes,
    info: itemInfo.find((e) => e.id === i.ingredient),
  }));
  return res;
});
