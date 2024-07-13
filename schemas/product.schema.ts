import { z } from "zod";
export const IngredientsSchema = z.object({
  item: z.string(),
  measure: z.number(),
  subtitute: z.array(z.string()),
});
export const ProductSchema = z.object({
  item: z.string(),
  ingredients: z.array(IngredientsSchema),
});

export type Product = z.output<typeof ProductSchema>;
export type ingredients = z.output<typeof IngredientsSchema>;
