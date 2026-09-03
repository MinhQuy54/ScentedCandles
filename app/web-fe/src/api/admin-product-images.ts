import { env } from "../config/env";
import type { ApiResponse, ProductImage } from "./types";

export async function uploadAdminProductImage(
  productId: string,
  file: File,
  options?: { altText?: string; isPrimary?: boolean },
) {
  const token = localStorage.getItem("accessToken");
  const form = new FormData();
  form.append("file", file);
  if (options?.altText) form.append("altText", options.altText);
  form.append("isPrimary", String(options?.isPrimary ?? true));

  const res = await fetch(
    `${env.apiBaseUrl}/admin/products/${productId}/images`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    },
  );

  if (!res.ok) throw new Error("UPLOAD_FAILED");
  return res.json() as Promise<ApiResponse<ProductImage>>;
}
