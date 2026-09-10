import { useEffect, useState } from "react";
import { adminGetOrders, adminUpdateOrderStatus } from "../../api/admin-orders";
import type { Order } from "../../api/types";
import { formatPrice } from "../../lib/products";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
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

  const filteredOrders = orders.filter((o) =>
    filterStatus === "ALL" ? true : o.status === filterStatus,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge bg-warning text-dark">1. Chờ duyệt (Giữ chỗ)</span>;
      case "PROCESSING":
        return <span className="badge bg-info text-dark">2. Đã duyệt (Đã trừ kho)</span>;
      case "SHIPPED":
        return <span className="badge bg-primary">3. Đang giao hàng</span>;
      case "DELIVERED":
        return <span className="badge bg-success">4. Giao thành công</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-dark" style={{ fontSize: "22px" }}>
            Quản lý Đơn hàng ({orders.length})
          </h2>
          <div className="text-muted small">Quản lý và duyệt đơn hàng, trừ kho thực tế.</div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="small fw-semibold text-muted">Lọc trạng thái:</label>
          <select
            className="form-select form-select-sm rounded-0"
            style={{ width: "200px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả ({orders.length})</option>
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="PROCESSING">Đã duyệt (PROCESSING)</option>
            <option value="SHIPPED">Đang giao (SHIPPED)</option>
            <option value="DELIVERED">Đã giao (DELIVERED)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger small mb-4">{error}</div>}

      <div className="card border-0 shadow-sm rounded-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "14px" }}>
            <thead className="table-light text-uppercase small text-muted">
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái đơn</th>
                <th>Ngày đặt</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="fw-bold text-dark">#{order.orderNumber}</span>
                      <div className="small text-muted">{order.items?.length || 0} sản phẩm</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{order.shippingRecipientName}</div>
                      <div className="text-muted small">{order.shippingPhone}</div>
                    </td>
                    <td className="fw-bold text-danger">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td>
                      <span className={`badge ${order.paymentStatus === "PAID" ? "bg-success" : "bg-secondary"}`}>
                        {order.paymentStatus}
                      </span>
                      <div className="text-muted small">{order.paymentMethod}</div>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-muted small">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Chi tiết
                        </button>

                        {/* Order status transitions */}
                        {order.status === "PENDING" && (
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                          >
                            {updatingId === order.id ? "Đang trừ kho..." : "Duyệt đơn (Trừ kho)"}
                          </button>
                        )}

                        {order.status === "PROCESSING" && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                          >
                            Giao vận chuyển
                          </button>
                        )}

                        {order.status === "SHIPPED" && (
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                          >
                            Đã hoàn thành
                          </button>
                        )}

                        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Detail Modal */}
      {selectedOrder && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-0 border-0">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold text-uppercase" style={{ fontSize: "16px" }}>
                  Chi tiết đơn hàng Admin #{selectedOrder.orderNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6 border-end">
                    <h6 className="fw-bold text-uppercase small text-muted">Địa chỉ nhận hàng</h6>
                    <div className="fw-bold text-dark mt-2">{selectedOrder.shippingRecipientName}</div>
                    <div className="small text-muted">SĐT: {selectedOrder.shippingPhone}</div>
                    <div className="small text-dark mt-1">
                      {selectedOrder.shippingStreetAddress}, {selectedOrder.shippingWard},{" "}
                      {selectedOrder.shippingDistrict}, {selectedOrder.shippingCity}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold text-uppercase small text-muted">Trạng thái đơn & Thanh toán</h6>
                    <div className="mt-2 small">Trạng thái đơn: {getStatusBadge(selectedOrder.status)}</div>
                    <div className="mt-1 small">Thanh toán: {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</div>
                  </div>
                </div>

                <h6 className="fw-bold text-uppercase small text-muted mb-2">Danh sách sản phẩm</h6>
                <table className="table align-middle small mb-3 border">
                  <thead className="table-light">
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
                          <div className="fw-semibold">{item.productName}</div>
                          <div className="text-muted small">SKU: {item.productSku}</div>
                        </td>
                        <td className="text-center fw-bold">{item.quantity}</td>
                        <td className="text-end">{formatPrice(item.unitPrice)}</td>
                        <td className="text-end fw-bold">{formatPrice(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex flex-column align-items-end gap-1 small">
                  <div>Tạm tính: <strong>{formatPrice(selectedOrder.subtotal)}</strong></div>
                  <div>Phí giao hàng: <strong>{formatPrice(selectedOrder.shippingFee)}</strong></div>
                  <div className="fw-bold text-danger mt-1" style={{ fontSize: "16px" }}>
                    Tổng cộng: {formatPrice(selectedOrder.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-0"
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
