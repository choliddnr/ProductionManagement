export default defineEventHandler(async (event) => {
  const data = await usePocketbase().send(
    "/c_api/items/stock/update/0k8dloanj5tmrcf",
    {
      method: "PATCH",
      body: {
        stock: 20,
        description: "Lorem ipsum",
        updated: "2024-07-03 12:30:24.755Z",
      },
    }
  );
  console.log("data", data);

  return "data";
});
