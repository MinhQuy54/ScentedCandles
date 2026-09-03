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
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
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
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  rawDescription: string;
  price: number;
  status?: string;
  isFeatured?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
