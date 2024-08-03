import { defineStore, acceptHMRUpdate } from "pinia";
import type { Customer } from "~~/schemas/customer.schema";

export const useCustomersStore = defineStore("customers", () => {
  const { data: customers, execute: fetch } =
    useFetch<Customer[]>("/api/customers");
  return { customers, fetch };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomersStore, import.meta.hot));
}
