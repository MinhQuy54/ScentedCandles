import { request } from "./client";
import type { ProductListData, Product } from "./types";


export async function fetchProducts(params?: { page?: number; name?: string}) {
    const query = new URLSearchParams()

    if (params?.page) query.set('page', String(params.page))
    if (params?.name) query.set('name', params.name)

    const qs = query.toString()

    return request<ProductListData>(`/products${qs ? `?${qs}` : ''}`) 
}

export async function fetchProduct(id: string) {
    return request<Product>(`/products/${id}`)
}