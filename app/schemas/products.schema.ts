import { z } from "zod";
import type { Item } from "./item.schema";

export const ProductsSchema = z.object({
  id: z.string(),
  cogc: z.number(),
  price: z.number(),
  cogc_params: z.array(
    z.object({
      attribute: z.string(),
      value: z.union([z.string(), z.number()]),
    })
  ),
});

export type Product = Item & Omit<z.infer<typeof ProductsSchema>, "id">;
export type BaseProduct = Pick<
  Product,
  "id" | "cogc" | "cogc_params" | "price"
>;
