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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  // Filter products
  const filteredProducts = items.filter((p) => {
    const matchesStatus = statusFilter === "ALL" ? true : p.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = items.filter((p) => p.status === "ACTIVE").length;
  const draftCount = items.filter((p) => p.status === "DRAFT").length;
  const inactiveCount = items.filter((p) => p.status === "INACTIVE").length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="fw-bold mb-1 text-dark fs-5">
            Quản lý Sản phẩm
          </h1>
          <p className="text-muted small m-0">
            Tạo mới, cập nhật giá và điều chỉnh catalog nến thơm AuraScent.
          </p>
        </div>
        <Link to="/admin/products/new" className="admin-action-btn admin-action-btn-primary">
          <i className="bi bi-plus-lg"></i> Thêm sản phẩm mới
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon brand">
            <i className="bi bi-box-seam"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{items.length}</div>
            <div className="admin-kpi-label">Tổng sản phẩm</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon emerald">
            <i className="bi bi-check-circle"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{activeCount}</div>
            <div className="admin-kpi-label">Đang mở bán</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon amber">
            <i className="bi bi-pencil-square"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{draftCount}</div>
            <div className="admin-kpi-label">Bản nháp (DRAFT)</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon sky">
            <i className="bi bi-pause-circle"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{inactiveCount}</div>
            <div className="admin-kpi-label">Ngừng bán</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-card mb-3 p-2 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="d-flex flex-wrap gap-1">
            {[
              { key: "ALL", label: "Tất cả", count: items.length },
              { key: "ACTIVE", label: "Đang bán", count: activeCount },
              { key: "DRAFT", label: "Nháp", count: draftCount },
              { key: "INACTIVE", label: "Ngừng bán", count: inactiveCount },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-sm rounded-pill px-2 py-1 small fw-semibold ${
                  statusFilter === tab.key
                    ? "btn-dark shadow-sm"
                    : "btn-light text-secondary border-0"
                }`}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}{" "}
                <span
                  className={`badge rounded-pill ms-1 ${
                    statusFilter === tab.key
                      ? "bg-danger text-white"
                      : "bg-secondary bg-opacity-25 text-dark"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="input-group input-group-sm" style={{ maxWidth: "240px" }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0 shadow-none small"
              placeholder="Tìm theo tên, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Mã SKU</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      <i className="bi bi-box fs-3 d-block mb-1 opacity-50"></i>
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
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
                              className="rounded border"
                              style={{ width: "36px", height: "36px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="rounded bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{ width: "36px", height: "36px" }}
                            >
                              <i className="bi bi-image text-secondary"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{product.name}</div>
                          {isDeleted && (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill mt-1">
                              Đã xóa mềm
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="font-monospace small text-muted bg-light px-2 py-1 rounded border">
                            {product.sku}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {product.category?.name ?? "Chưa phân loại"}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">
                            {formatPrice(product.price)}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-badge-status ${
                              product.status === "ACTIVE"
                                ? "admin-badge-delivered"
                                : product.status === "DRAFT"
                                ? "admin-badge-pending"
                                : "admin-badge-cancelled"
                            }`}
                          >
                            {STATUS_LABELS[product.status] ?? product.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="admin-action-btn admin-action-btn-outline"
                            >
                              <i className="bi bi-pencil"></i> Sửa
                            </Link>
                            {!isDeleted && (
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn-danger"
                                disabled={deletingId === product.id}
                                onClick={() => void handleDelete(product)}
                              >
                                <i className="bi bi-trash"></i>
                                {deletingId === product.id ? "Đang xóa…" : "Xóa"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

