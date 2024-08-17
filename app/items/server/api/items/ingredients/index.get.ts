export default defineEventHandler(async (event) => {
  const selfProducedItemId = getQuery(event).id as string;
  return await usePocketbase()
    .collection("ingredients")
    .getFullList({
      filter: usePocketbase().filter(
        "self_produced_item = {:selfProducedItemId}",
        { selfProducedItemId: selfProducedItemId }
      ),
    });
});
