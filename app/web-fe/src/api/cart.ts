import { getAccessToken } from './auth';
import { request } from './client';
import type { Cart } from './types';

export interface PayloadAddToCart {
    productId: string;
    quantity: number;
}

export type PayloadUpdateCartItem =
    Partial<PayloadAddToCart>;

export function getCartSessionId(): string {
    let sid = localStorage.getItem('aurascent_session_id');

    if (!sid) {
        sid =
            'sid' +
            Math.random().toString(36).substring(2) +
            Date.now().toString(36);

        localStorage.setItem('aurascent_session_id', sid);
    }

    return sid;
}

function getCartHeaders() {
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'x-session-id': getCartSessionId(),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return { headers };
}

export async function fetchCart() {
    return request<Cart>('/cart', {
        ...getCartHeaders(),
    });
}

export async function addToCartApi(
    payload: PayloadAddToCart,
) {
    return request<Cart>('/cart/items', {
        method: 'POST',
        body: JSON.stringify(payload),
        ...getCartHeaders(),
    });
}

export async function updateCartItemApi(
    productId: string,
    quantity: number,
) {
    return request<Cart>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
        ...getCartHeaders(),
    });
}

export async function removeCartItemApi(
    productId: string,
) {
    return request<Cart>(`/cart/items/${productId}`, {
        method: 'DELETE',
        ...getCartHeaders(),
    });
}

export async function mergeCartApi(
    guestSessionId: string,
) {
    return request<Cart>('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({
            guestSessionId,
        }),
        ...getCartHeaders(),
    });
}