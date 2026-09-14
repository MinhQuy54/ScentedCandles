import { request } from "./client";

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
    role: "CUSTOMER" | "ADMIN";
    created_at: string;
}

export async function fetchAdminUsers() {
    return request<AdminUser[]>("/admin/users");
}

export async function updateAdminUserStatus(id: string, isActive: boolean) {
    return request<AdminUser>(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
    });
}

export async function updateAdminUserRole(id: string, role: "CUSTOMER" | "ADMIN") {
    return request<AdminUser>(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });
}

export async function deleteAdminUser(id: string) {
    return request<{ id: string }>(`/admin/users/${id}`, {
        method: "DELETE",
    });
}