import { request } from "./client";
import type { CreateOrderPayload, Order } from "./types";

export async function createOrder(
    payload: CreateOrderPayload
): Promise<Order> {
    const res = await request<Order>('/orders', {
        method: "POST",
        body: JSON.stringify(payload)
    })
    return res.data
}

export async function getOrders(): Promise<Order[]> {
    const res = await request<Order[]>('/orders');
    return res.data;
}
export async function cancelOrder(id: string): Promise<Order> {
    const res = await request<Order>(`/orders/${id}/cancel`, {
        method: 'POST',
    });
    return res.data;
}
