export enum ProductStatus {
   DRAFT = 'DRAFT',
   PROCESSING = 'PROCESSING',
   ACTIVE = 'ACTIVE',
   INACTIVE = 'INACTIVE',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
    COD = 'COD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD = 'CARD',
    E_WALLET = 'E_WALLET',
}


export enum VoucherType {
    PERCENT = 'PERCENT',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum VoucherStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED',
}

export enum AttributeInputType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    SINGLE_SELECT = 'SINGLE_SELECT',
    MULTI_SELECT = 'MULTI_SELECT',
}

export enum AttributeGroup {
    SCENT = 'SCENT',
    PHYSICAL = 'PHYSICAL',
    MERCHANDISING = 'MERCHANDISING',
}

export enum ExtractionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum InventoryTransactionType {
    ORDER = 'ORDER',
    RETURN = 'RETURN',
    ADJUSTMENT = 'ADJUSTMENT',
    RESERVE = 'RESERVE',
    RELEASE = 'RELEASE',
}

export enum ContactType {
    GENERAL = 'GENERAL',
    SUPPORT = 'SUPPORT',
    PARTNER = 'PARTNER',
    FEEDBACK = 'FEEDBACK',
}

export enum ContactStatus {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    STAFF = 'STAFF',
}

