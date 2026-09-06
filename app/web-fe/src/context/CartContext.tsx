import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    addToCartApi,
    fetchCart,
    removeCartItemApi,
    updateCartItemApi,
} from '../api/cart';
import { useAuth } from './AuthContext';
import { notification } from 'antd';

export interface ServerCartItem {
    productId: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        sku: string;
        price: string;
        compareAtPrice?: string;
        primaryImage: string;
    };
    lineTotal: number;
}

interface CartContextValue {
    items: ServerCartItem[];
    totalItems: number;
    totalPrice: number;
    loading: boolean;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ServerCartItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen((prev) => !prev);

    const refreshCart = async () => {
        try {
            setLoading(true);
            const res = await fetchCart();
            setItems(res.data.items);
            setTotalItems(res.data.totalItems);
            setTotalPrice(res.data.totalPrice);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void refreshCart();
    }, [user]);

    const addToCart = async (productId: string, quantity = 1) => {
        try {
            const res = await addToCartApi({ productId, quantity });
            setItems(res.data.items);
            setTotalItems(res.data.totalItems);
            setTotalPrice(res.data.totalPrice);
            setIsCartOpen(true);
        } catch {
            notification.error({
                message: 'Thêm vào giỏ thất bại',
                duration: 2,
            });
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            const res = await updateCartItemApi(productId, quantity);
            setItems(res.data.items);
            setTotalItems(res.data.totalItems);
            setTotalPrice(res.data.totalPrice);
        } catch {
            notification.error({ message: 'Không thể cập nhật số lượng' });
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const res = await removeCartItemApi(productId);
            setItems(res.data.items);
            setTotalItems(res.data.totalItems);
            setTotalPrice(res.data.totalPrice);
        } catch {
            notification.error({ message: 'Không thể xóa sản phẩm' });
        }
    };

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                totalPrice,
                loading,
                isCartOpen,
                setIsCartOpen,
                openCart,
                closeCart,
                toggleCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
