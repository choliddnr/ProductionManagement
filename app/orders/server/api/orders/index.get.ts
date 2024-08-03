export default defineEventHandler(async (event) => {
  console.log("fetch orders");

  return usePocketbase().collection("orders").getFullList({
    expand: "customer",
    sort: "-created",
  });
});
