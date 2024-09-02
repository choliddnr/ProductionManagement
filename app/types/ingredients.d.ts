export type Ingredient = {
  id?: string;
  self_produced_item: string;
  ingredient: string;
  quantity: number;
  substitutes: string[];
};
