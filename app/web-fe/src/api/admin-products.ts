import { request } from "./client";
import type {
  Product,
  ProductListData,
  CreateProductPayload,
  UpdateProductPayload,
} from "./types";

export async function fetchAdminProducts(params?: {
  page?: number;
  name?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.name) query.set("name", params.name);
  const qs = query.toString();
  return request<ProductListData>(`/admin/products${qs ? `?${qs}` : ""}`);
}

export async function fetchAdminProduct(id: string) {
  return request<Product>(`/admin/products/${id}`);
}

export async function createAdminProduct(payload: CreateProductPayload) {
  return request<Product>("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateProductPayload,
) {
  return request<Product>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminProduct(id: string) {
  return request<{ id: string; deleted_at: string }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}
