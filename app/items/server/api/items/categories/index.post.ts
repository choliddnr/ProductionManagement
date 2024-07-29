export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await usePocketbase().collection("item_categories").create(body);
});
