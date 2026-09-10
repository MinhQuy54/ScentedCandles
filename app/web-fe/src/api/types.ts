export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder?: number;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  categoryId: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  rawDescription: string;
  price: string;
  compareAtPrice?: string;
  status: string;
  isFeatured: boolean;
  deleted_at?: string | null;
  category?: ProductCategory;
  images?: ProductImage[];
}

export interface ProductListData {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role?: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterData {
  id: string;
  email: string;
  fullName: string;
}

export interface CreateProductPayload {
  categoryId: string;
  sku?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  rawDescription: string;
  price: number;
  status?: string;
  isFeatured?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;


export interface CartItem {
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

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  created_at: string;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;


export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  product?: {
    id: string;
    images?: { url: string; isPrimary: boolean; sortOrder?: number }[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  shippingRecipientName: string;
  shippingPhone: string;
  shippingStreetAddress: string;
  shippingWard: string;
  shippingDistrict: string;
  shippingCity: string;
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
  items?: OrderItem[];
  created_at: string;
}

export interface CreateOrderPayload {
  addressId?: string;
  recipientName?: string;
  phone?: string;
  streetAddress?: string;
  ward?: string;
  district?: string;
  city?: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  note?: string;
}