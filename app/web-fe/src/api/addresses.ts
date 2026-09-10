import { request } from "./client";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "./types";

export async function getAddress(): Promise<Address[]> {
  const res = await request<Address[]>(`/addresses`);
  return res.data;
}

export async function createAddress(payload: CreateAddressPayload): Promise<Address> {
  const res = await request<Address>(`/addresses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAddress(id: string, payload: UpdateAddressPayload): Promise<Address> {
  const res = await request<Address>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await request<null>(`/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const res = await request<Address>(`/addresses/${id}/default`, {
    method: "PATCH",
  });
  return res.data;
}

