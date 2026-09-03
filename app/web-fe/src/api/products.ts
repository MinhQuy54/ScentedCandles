import { request } from "./client";
import type { ProductListData, Product } from "./types";

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
}) {
  const query = new URLSearchParams();

  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.name) query.set("name", params.name);
  if (params?.categoryId) query.set("categoryId", params.categoryId);

  const qs = query.toString();

  return request<ProductListData>(`/products${qs ? `?${qs}` : ""}`);
}

export async function fetchProduct(id: string) {
  return request<Product>(`/products/${id}`);
}
