import { request } from "./client"
import type { ProductCategory } from "./types"

export interface CreateCategoryPayload {
    name: string
    slug?: string
    description?: string
    sortOrder?: number
    isActive?: boolean
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>

export async function fetchAdminCategories() {
    return request<ProductCategory[]>(`/admin/categories`);
}

export async function createAdminCategory(payload: CreateCategoryPayload) {
    return request<ProductCategory>(`/admin/categories`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateAdminCategory(
    id: string,
    payload: UpdateCategoryPayload,
) {
    return request<ProductCategory>(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteAdminCategory(id: string) {
    return request<{ id: string; deleted_at: string }>(`/admin/categories/${id}`, {
        method: "DELETE",
    });
}
