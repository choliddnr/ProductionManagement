export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  const body = await readBody(event);
  console.log("body:", body);

  // return await usePocketbase().send("/c_api/items/stock/update/" + id, {
  //   method: "PATCH",
  //   body: body,
  // });
  try {
    const data = await usePocketbase()
      .collection("items")
      .update(id, { stock: body.newStock });

    await usePocketbase()
      .collection("stock_logs")
      .create({
        item: data.id,
        change: body.newStock - body.currentStock,
      });
    return data;
  } catch (error) {
    return error;
  }
});
