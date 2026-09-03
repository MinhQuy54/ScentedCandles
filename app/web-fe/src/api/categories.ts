import { request } from "./client";
import type { ProductCategory } from "./types";

export async function fetchCategories() {
  return request<ProductCategory[]>("/categories");
}
