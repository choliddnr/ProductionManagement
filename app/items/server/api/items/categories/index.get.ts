export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  if (id) return await usePocketbase().collection("item_categories").getOne(id);
  return await usePocketbase().collection("item_categories").getFullList();
});
