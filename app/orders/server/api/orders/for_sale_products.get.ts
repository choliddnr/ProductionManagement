export default defineEventHandler(async (event) => {
  const order = getQuery(event).orderId;
  console.log("products called");

  return usePocketbase().collection("products").getFullList();
});
