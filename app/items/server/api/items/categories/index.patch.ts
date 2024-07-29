export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  const body = await readBody(event);
  return await usePocketbase().collection("item_categories").update(id, body);
});
