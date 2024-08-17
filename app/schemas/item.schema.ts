import { z } from "zod";
/**
 * @itemCategories
 *
 */

export const itemCategories = [
  "raw material",
  "semi-finished",
  "final product",
] as const;

export const IngredientsSchema = z.object({
  id: z.string().optional(),
  self_produced_item: z.string(),
  ingredient: z.string(),
  quantity: z.number(),
  substitutes: z.array(z.string()),
});

export type Ingredients = z.output<typeof IngredientsSchema>;

const ItemCategoriesEnum = z.enum([...itemCategories]);
// export type ItemCategories = z.output<typeof ItemCategoriesEnum>;

export const AddItemSchema = z.object({
  title: z.string().min(5).max(25),
  description: z.string().optional(),
  category: z.string(),
  uom: z.string().min(2),
  // for_sale: z.boolean(),
  // self_produced: z.boolean(),
});

export const EditItemSchema = z.object({
  title: z.string().min(5).max(25),
  description: z.string().optional(),
  // for_sale: z.boolean(),
  // self_produced: z.boolean(),
  updated: z.date(),
});

export const EditItemStockSchema = z.object({
  stock: z.number(),
  description: z.string().min(10),
  updated: z.date().optional(),
});

// export const EditItemForecastSchema = z.object({
//   stock: z.number(),
//   updated: z.date(),
// });

export type Item = z.output<typeof AddItemSchema> & {
  id: string;
  stock: number;
  // forecast: number;
  updated: Date;
};
export type ItemsTable = Item & {
  category_info?: {
    title: string;
    color: string;
  };
};

export const ItemCategorySchema = z.object({
  title: z.string().min(4),
  description: z.string().max(70),
  color: z.string().min(3),
});

export type ItemCategory = z.output<typeof ItemCategorySchema>;
