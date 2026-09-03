import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { notification } from "antd";
import type { Product } from "../../api/types";
import {
  deleteAdminProduct,
  fetchAdminProducts,
} from "../../api/admin-products";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PROCESSING: "Đang xử lý",
  ACTIVE: "Đang bán",
  INACTIVE: "Ngừng bán",
};

function formatPrice(value: string) {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

export function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAdminProducts({ page: 1 });
      setItems(res.data.data);
    } catch {
      notification.error({
        message: "Không tải được danh sách",
        description: "Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Xóa sản phẩm "${product.name}"? (xóa mềm, có thể khôi phục sau)`,
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    try {
      await deleteAdminProduct(product.id);
      notification.success({
        message: "Đã xóa sản phẩm",
        placement: "topRight",
        duration: 3,
      });
      await loadProducts();
    } catch {
      notification.error({
        message: "Xóa thất bại",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="admin-header">
          <div>
            <h1 className="admin-heading">Quản trị sản phẩm</h1>
            <p className="admin-lead">Tạo, chỉnh sửa và quản lý catalog AuraScent.</p>
          </div>
          <Link to="/admin/products/new" className="btn auth-submit">
            + Thêm sản phẩm
          </Link>
        </div>

        {loading ? (
          <p className="text-muted py-4">Đang tải…</p>
        ) : items.length === 0 ? (
          <p className="text-muted py-4">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="table-responsive admin-table-wrap">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>SKU</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.isPrimary) ??
                    product.images?.[0];
                  const isDeleted = Boolean(product.deleted_at);

                  return (
                    <tr
                      key={product.id}
                      className={isDeleted ? "admin-row-deleted" : undefined}
                    >
                      <td>
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={primaryImage.altText ?? product.name}
                            className="admin-thumb"
                          />
                        ) : (
                          <span className="admin-thumb-placeholder">—</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-product-name">{product.name}</div>
                        {isDeleted && (
                          <span className="admin-badge admin-badge-muted">
                            Đã xóa
                          </span>
                        )}
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.category?.name ?? "—"}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span
                          className={`admin-badge admin-badge-${product.status.toLowerCase()}`}
                        >
                          {STATUS_LABELS[product.status] ?? product.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="admin-actions">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Sửa
                          </Link>
                          {!isDeleted && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={deletingId === product.id}
                              onClick={() => void handleDelete(product)}
                            >
                              {deletingId === product.id ? "Đang xóa…" : "Xóa"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
}
