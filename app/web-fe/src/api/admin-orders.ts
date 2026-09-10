import { request } from './client';
import type { Order } from './types';

export async function adminGetOrders(): Promise<Order[]> {
    const res = await request<Order[]>('/admin/orders');
    return res.data;
}

export async function adminUpdateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await request<Order>(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    return res.data;
}
