export default defineEventHandler(async (event) => {
  const order = getQuery(event).orderId;
  return usePocketbase().collection("products").getFullList();
});
