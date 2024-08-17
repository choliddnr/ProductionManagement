export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  const body = await readBody(event);
  return usePocketbase().collection("order_products").update(id, body);
});
