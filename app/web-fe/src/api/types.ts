export interface ApiResponse<T> {
    success: boolean
    code: number
    message: string
    data: T
  }
  
  export interface ProductImage {
    id: string
    url: string
    altText?: string
    isPrimary: boolean
  }
  
  export interface ProductCategory {
    id: string
    name: string
    slug: string
  }
  
  export interface Product {
    id: string
    categoryId: string
    sku: string
    name: string
    slug: string
    shortDescription?: string
    rawDescription: string
    price: string
    compareAtPrice?: string
    status: string
    isFeatured: boolean
    category?: ProductCategory
    images?: ProductImage[]
  }
  
  export interface ProductListData {
    data: Product[]
    total: number
    page: number
    limit: number
  }