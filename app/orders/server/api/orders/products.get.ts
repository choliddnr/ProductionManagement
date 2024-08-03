export default defineEventHandler(async (event) => {
  const order = getQuery(event).orderId;
  return usePocketbase()
    .collection("order_products")
    .getFullList({
      filter: usePocketbase().filter("order = {:order}", { order: order }),
    });
});
