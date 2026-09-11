import { useEffect, useState } from "react";
import { adminGetOrders, adminUpdateOrderStatus } from "../../api/admin-orders";
import type { Order } from "../../api/types";
import { formatPrice } from "../../lib/products";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminGetOrders();
      setOrders(data);
    } catch {
      setError("Không thể tải danh sách đơn hàng Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const updated = await adminUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "ALL" ? true : o.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingRecipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const processingCount = orders.filter((o) => o.status === "PROCESSING").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="admin-badge-status admin-badge-pending">
            <i className="bi bi-clock-history"></i> Chờ duyệt (Giữ chỗ)
          </span>
        );
      case "PROCESSING":
        return (
          <span className="admin-badge-status admin-badge-processing">
            <i className="bi bi-gear-fill"></i> Đã duyệt (Đã trừ kho)
          </span>
        );
      case "SHIPPED":
        return (
          <span className="admin-badge-status admin-badge-shipped">
            <i className="bi bi-truck"></i> Đang giao hàng
          </span>
        );
      case "DELIVERED":
        return (
          <span className="admin-badge-status admin-badge-delivered">
            <i className="bi bi-check-circle-fill"></i> Giao thành công
          </span>
        );
      case "CANCELLED":
        return (
          <span className="admin-badge-status admin-badge-cancelled">
            <i className="bi bi-x-circle-fill"></i> Đã hủy
          </span>
        );
      default:
        return <span className="admin-badge-status admin-badge-processing">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="fw-bold mb-1 text-dark fs-5">
            Quản lý Đơn hàng
          </h1>
          <p className="text-muted small m-0">
            Theo dõi, xử lý luồng đơn hàng và kiểm soát kho thực tế.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="admin-action-btn admin-action-btn-outline"
        >
          <i className="bi bi-arrow-clockwise"></i> Làm mới dữ liệu
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 small">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon brand">
            <i className="bi bi-wallet2"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{formatPrice(totalRevenue)}</div>
            <div className="admin-kpi-label">Doanh thu tổng</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon amber">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{pendingCount}</div>
            <div className="admin-kpi-label">Chờ duyệt (PENDING)</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon indigo">
            <i className="bi bi-truck"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{shippedCount}</div>
            <div className="admin-kpi-label">Đang giao (SHIPPED)</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon emerald">
            <i className="bi bi-check2-all"></i>
          </div>
          <div>
            <div className="admin-kpi-value">{deliveredCount}</div>
            <div className="admin-kpi-label">Hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="admin-card mb-3 p-2 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="d-flex flex-wrap gap-1">
            {[
              { key: "ALL", label: "Tất cả", count: orders.length },
              { key: "PENDING", label: "Chờ duyệt", count: pendingCount },
              { key: "PROCESSING", label: "Đã duyệt", count: processingCount },
              { key: "SHIPPED", label: "Đang giao", count: shippedCount },
              { key: "DELIVERED", label: "Đã giao", count: deliveredCount },
              { key: "CANCELLED", label: "Đã hủy", count: cancelledCount },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-sm rounded-pill px-2 py-1 small fw-semibold ${filterStatus === tab.key
                  ? "btn-dark shadow-sm"
                  : "btn-light text-secondary border-0"
                  }`}
                onClick={() => setFilterStatus(tab.key)}
              >
                {tab.label}{" "}
                <span
                  className={`badge rounded-pill ms-1 ${filterStatus === tab.key ? "bg-danger text-white" : "bg-secondary bg-opacity-25 text-dark"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="input-group input-group-sm" style={{ maxWidth: "240px" }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0 shadow-none small"
              placeholder="Tìm mã đơn, tên, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái đơn</th>
                <th>Thời gian</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-1 text-muted opacity-50"></i>
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerInitials = order.shippingRecipientName
                    ? order.shippingRecipientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "KH";

                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="fw-bold text-dark font-monospace">
                          #{order.orderNumber}
                        </div>
                        <div className="small text-muted">
                          {order.items?.length || 0} món
                        </div>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-secondary bg-opacity-10 text-dark fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: "28px", height: "28px", fontSize: "11px" }}
                          >
                            {customerInitials}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">
                              {order.shippingRecipientName}
                            </div>
                            <div className="text-muted small">
                              {order.shippingPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge rounded-pill ${order.paymentStatus === "PAID"
                            ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                            : "bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"
                            }`}
                        >
                          {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                        <div className="text-muted small mt-1">
                          {order.paymentMethod}
                        </div>
                      </td>

                      <td>{getStatusBadge(order.status)}</td>

                      <td className="text-muted small">
                        {new Date(order.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn-outline"
                            onClick={() => setSelectedOrder(order)}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i> Chi tiết
                          </button>

                          {/* Transition Actions */}
                          {order.status === "PENDING" && (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-primary"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                            >
                              <i className="bi bi-check2-circle"></i> Duyệt đơn
                            </button>
                          )}

                          {order.status === "PROCESSING" && (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-primary"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                            >
                              <i className="bi bi-truck"></i> Giao hàng
                            </button>
                          )}

                          {order.status === "SHIPPED" && (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-success"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                            >
                              <i className="bi bi-box-seam-check"></i> Hoàn thành
                            </button>
                          )}

                          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-danger"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                            >
                              <i className="bi bi-x-circle"></i> Hủy
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

      {/* Admin Order Detail Drawer / Modal */}
      {selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: "10px", overflow: "hidden" }}>
              <div className="modal-header bg-dark text-white p-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-receipt text-danger fs-5"></i>
                  <h5 className="modal-title fw-bold m-0 fs-6">
                    Chi tiết Đơn hàng #{selectedOrder.orderNumber}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>

              <div className="modal-body p-3">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded h-100 border">
                      <h6 className="fw-bold text-uppercase small text-muted mb-2">
                        <i className="bi bi-geo-alt me-1"></i> Thông tin giao hàng
                      </h6>
                      <div className="fw-bold text-dark fs-6">{selectedOrder.shippingRecipientName}</div>
                      <div className="text-muted small">SĐT: {selectedOrder.shippingPhone}</div>
                      <div className="small text-secondary mt-2">
                        {selectedOrder.shippingStreetAddress}, {selectedOrder.shippingWard},{" "}
                        {selectedOrder.shippingDistrict}, {selectedOrder.shippingCity}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded h-100 border">
                      <h6 className="fw-bold text-uppercase small text-muted mb-2">
                        <i className="bi bi-credit-card me-1"></i> Trạng thái & Thanh toán
                      </h6>
                      <div className="mb-2">{getStatusBadge(selectedOrder.status)}</div>
                      <div className="small text-secondary mt-1">
                        Thanh toán: <strong>{selectedOrder.paymentStatus}</strong> ({selectedOrder.paymentMethod})
                      </div>
                      <div className="small text-muted mt-1">
                        Ngày đặt: {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold text-uppercase small text-muted mb-2">
                  <i className="bi bi-box-seam me-1"></i> Sản phẩm trong đơn ({selectedOrder.items?.length || 0})
                </h6>

                <div className="table-responsive mb-3 border rounded overflow-hidden">
                  <table className="table align-middle mb-0 small">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-semibold text-dark">{item.productName}</div>
                            <div className="text-muted small">SKU: {item.productSku}</div>
                          </td>
                          <td className="text-center fw-bold">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.unitPrice)}</td>
                          <td className="text-end fw-bold text-dark">{formatPrice(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-light rounded d-flex flex-column align-items-end gap-1">
                  <div className="d-flex justify-content-between w-100 max-w-sm small">
                    <span className="text-muted">Tạm tính:</span>
                    <strong>{formatPrice(selectedOrder.subtotal)}</strong>
                  </div>
                  <div className="d-flex justify-content-between w-100 max-w-sm small">
                    <span className="text-muted">Phí giao hàng:</span>
                    <strong>{formatPrice(selectedOrder.shippingFee)}</strong>
                  </div>
                  <hr className="w-100 my-2" />
                  <div className="d-flex justify-content-between w-100 max-w-sm align-items-center">
                    <span className="fw-bold text-dark">Tổng tiền thanh toán:</span>
                    <span className="fw-bold text-danger fs-6">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-2 px-3">
                <button
                  type="button"
                  className="admin-action-btn admin-action-btn-outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

