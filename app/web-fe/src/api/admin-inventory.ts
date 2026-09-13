import { request } from "./client"
import type { InventoryItem, InventoryTransaction } from "./types"

export async function fetchAdminInventory() {
    return request<InventoryItem[]>(`/admin/inventory`);
}

export async function updateAdminStock(
    productId: string,
    quantityOnHand: number,
    note?: string
) {
    return request<InventoryItem>(`/admin/inventory/product/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantityOnHand, note }),
    });
}

export async function adjustAdminStock(
    productId: string,
    quantityChange: number,
    note?: string
) {
    return request<InventoryItem>(`/admin/inventory/product/${productId}/adjust`, {
        method: "POST",
        body: JSON.stringify({ quantityChange, note }),
    });
}

export async function fetchInventoryTransactions(productId: string) {
    return request<InventoryTransaction[]>(`/admin/inventory/product/${productId}/transactions`);
}
