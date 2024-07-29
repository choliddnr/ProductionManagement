import { z } from "zod";

export const itemCategories = [
  "raw material",
  "semi-finished",
  "final product",
] as const;

export const IngredientsSchema = z.object({
  id: z.string().optional(),
  product: z.string(),
  item: z.string(),
  qty: z.number(),
  substitutes: z.array(z.string()),
});

export type Ingredients = z.output<typeof IngredientsSchema>;

const ItemCategoriesEnum = z.enum([...itemCategories]);
export type ItemCategories = z.output<typeof ItemCategoriesEnum>;

export const AddItemSchema = z.object({
  title: z.string().min(5).max(25),
  description: z.string().optional(),
  barcode: z.number().optional(),
  category: z.string().optional(),
  unit: z.string().min(2),
  selfMade: z.boolean(),
});

export const EditItemSchema = z.object({
  title: z.string().min(5).max(25),
  description: z.string().optional(),
  updated: z.date(),
});

export const EditItemStockSchema = z.object({
  stock: z.number(),
  description: z.string().min(10),
  updated: z.date().optional(),
});

export const EditItemForecastSchema = z.object({
  stock: z.number(),
  updated: z.date(),
});

export type Item = z.output<typeof AddItemSchema> & {
  id: string;
  stock: number;
  forecast: number;
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
