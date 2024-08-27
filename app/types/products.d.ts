export type Product = {
  id?: string;
  cogc: number;
  cogc_params: { attribute: string; value: string | number }[];
  price: number;
};
