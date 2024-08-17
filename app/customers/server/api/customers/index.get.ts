export default defineEventHandler(async () => {
  const is_customer = true;
  return await usePocketbase()
    .collection("stakeholders")
    .getFullList({
      filter: usePocketbase().filter("is_customer = {:is_customer}", {
        is_customer: is_customer,
      }),
    });
});
