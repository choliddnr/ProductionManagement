export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  return await usePocketbase().collection("item_categories").delete(id);
});
