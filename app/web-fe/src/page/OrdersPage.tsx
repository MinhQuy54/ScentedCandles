import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { notification } from "antd";
import { cancelOrder, getOrders } from "../api/orders";
import type { Order } from "../api/types";
import { formatPrice, getImageUrl } from "../lib/products";

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Chờ xác nhận", badgeClass: "bg-warning text-dark" },
  PROCESSING: { label: "Đang xử lý", badgeClass: "bg-primary text-white" },
  SHIPPED: { label: "Đang giao hàng", badgeClass: "bg-info text-dark" },
  DELIVERED: { label: "Đã giao hàng", badgeClass: "bg-success text-white" },
  CANCELLED: { label: "Đã hủy", badgeClass: "bg-secondary text-white" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  PENDING: { label: "Chờ thanh toán", badgeClass: "bg-warning text-dark" },
  PAID: { label: "Đã thanh toán", badgeClass: "bg-success text-white" },
  FAILED: { label: "Thanh toán thất bại", badgeClass: "bg-danger text-white" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng / VietQR",
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));

    const isSuccess = searchParams.get("success");
    const orderNumber = searchParams.get("orderNumber");
    if (isSuccess === "true" && orderNumber) {
      notification.success({
        message: "Đặt hàng thành công!",
        description: `Đơn hàng #${orderNumber} của bạn đã được khởi tạo thành công.`,
        placement: "topRight",
        duration: 5,
      });
      searchParams.delete("success");
      searchParams.delete("orderNumber");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleCancel = async (id: string) => {
    if (confirm("Bạn muốn hủy đơn hàng này?")) {
      try {
        const updated = await cancelOrder(id);
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        notification.success({
          message: "Hủy đơn thành công",
          description: `Đơn hàng #${updated.orderNumber} đã được hủy.`,
          placement: "topRight",
        });
      } catch (err: any) {
        notification.error({
          message: "Không thể hủy đơn",
          description: err.message || "Đã có lỗi xảy ra.",
          placement: "topRight",
        });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Đơn hàng của tôi</span>
        </div>
      </div>

      <div className="container py-5" style={{ maxWidth: "1000px" }}>
        <div className="d-flex align-items-baseline gap-2 mb-4">
          <h4 className="fw-bold text-uppercase fs-4 m-0">Đơn hàng của tôi</h4>
          {!loading && (
            <span className="small text-muted">({orders.length} đơn hàng)</span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Đang tải đơn hàng...
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="card rounded-0 shadow-sm p-5 text-center text-muted">
            <i className="bi bi-bag-x fs-1 d-block mb-3 text-secondary"></i>
            <p className="mb-4 fs-6">Bạn chưa có đơn hàng nào.</p>
            <div>
              <Link to="/products" className="btn catalog-see-more">
                Mua sắm ngay
              </Link>
            </div>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {orders.map((o) => {
              const statusCfg = STATUS_MAP[o.status] ?? STATUS_MAP["PENDING"];
              const paymentCfg = PAYMENT_STATUS_MAP[o.paymentStatus] ?? PAYMENT_STATUS_MAP["PENDING"];
              const isExpanded = expandedId === o.id;
              const formattedDate = new Date(o.created_at).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <div key={o.id} className="card rounded-0 shadow-sm overflow-hidden">
                  {/* Header — always visible, click to toggle */}
                  <div
                    className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4"
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandedId(isExpanded ? null : o.id)}
                    role="button"
                    aria-expanded={isExpanded}
                  >
                    <div>
                      <span className="fw-bold small text-uppercase">Mã đơn: #{o.orderNumber}</span>
                      <div className="text-muted" style={{ fontSize: "12px" }}>{formattedDate}</div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-danger">{formatPrice(parseFloat(o.totalAmount))}</span>
                      <span className={`badge ${statusCfg.badgeClass}`}>{statusCfg.label}</span>
                      <i className={`bi bi-chevron-${isExpanded ? "up" : "down"} text-muted`}></i>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="card-body px-4 py-3">
                      <div className="row g-4">
                        {/* Payment info */}
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-3 fs-6 text-uppercase" style={{ fontSize: "12px !important", letterSpacing: "0.05em" }}>
                            Thông tin thanh toán
                          </h6>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span className="text-muted">Phương thức</span>
                            <span className="fw-semibold text-end" style={{ maxWidth: "60%" }}>
                              {PAYMENT_METHOD_MAP[o.paymentMethod] ?? o.paymentMethod}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2 small">
                            <span className="text-muted">Trạng thái TT</span>
                            <span className={`badge ${paymentCfg.badgeClass}`}>{paymentCfg.label}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span className="text-muted">Tạm tính</span>
                            <span>{formatPrice(parseFloat(o.subtotal))}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2 small">
                            <span className="text-muted">Phí vận chuyển</span>
                            <span>
                              {parseFloat(o.shippingFee) === 0
                                ? "Miễn phí"
                                : formatPrice(parseFloat(o.shippingFee))}
                            </span>
                          </div>
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between small">
                            <span className="fw-bold">Tổng cộng</span>
                            <span className="fw-bold text-danger fs-6">
                              {formatPrice(parseFloat(o.totalAmount))}
                            </span>
                          </div>
                        </div>

                        {/* Shipping address */}
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-3 fs-6 text-uppercase" style={{ fontSize: "12px !important", letterSpacing: "0.05em" }}>
                            Địa chỉ giao hàng
                          </h6>
                          <div className="address-card-item">
                            <div className="address-card-head">
                              <div>
                                <span className="address-card-name">{o.shippingRecipientName}</span>
                                <span className="address-card-phone">({o.shippingPhone})</span>
                              </div>
                            </div>
                            <div className="address-card-text">
                              {o.shippingStreetAddress}, {o.shippingWard}, {o.shippingDistrict}, {o.shippingCity}
                            </div>
                          </div>
                        </div>

                        {/* Order items */}
                        {o.items && o.items.length > 0 && (
                          <div className="col-12">
                            <h6 className="fw-bold mb-3 fs-6 text-uppercase" style={{ letterSpacing: "0.05em" }}>
                              Sản phẩm trong đơn ({o.items.length})
                            </h6>
                            <div className="border rounded-0 overflow-hidden">
                              {o.items.map((item, idx) => {
                                const primaryImg = item.product?.images?.find((img) => img.isPrimary)
                                  ?? item.product?.images?.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
                                return (
                                  <div
                                    key={item.id}
                                    className={`d-flex align-items-center gap-3 px-3 py-2 ${idx < o.items!.length - 1 ? "border-bottom" : ""}`}
                                  >
                                    {/* Thumbnail */}
                                    <div
                                      className="flex-shrink-0 bg-light rounded-0 overflow-hidden"
                                      style={{ width: 56, height: 56 }}
                                    >
                                      {primaryImg ? (
                                        <img
                                          src={primaryImg.url}
                                          alt={item.productName}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      ) : (
                                        <div
                                          className="w-100 h-100 d-flex align-items-center justify-content-center text-muted"
                                          style={{ fontSize: 20 }}
                                        >
                                          <i className="bi bi-image"></i>
                                        </div>
                                      )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow-1 overflow-hidden">
                                      <div className="fw-semibold small text-truncate">{item.productName}</div>
                                      <div className="text-muted" style={{ fontSize: "12px" }}>
                                        SKU: {item.productSku} &nbsp;·&nbsp; {formatPrice(parseFloat(item.unitPrice))} / cái
                                      </div>
                                    </div>

                                    {/* Qty + total */}
                                    <div className="flex-shrink-0 text-end">
                                      <div className="small text-muted">× {item.quantity}</div>
                                      <div className="fw-bold text-danger small">
                                        {formatPrice(parseFloat(item.totalPrice))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cancel action */}
                      {o.status === "PENDING" && (
                        <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                          <button
                            id={`btn-cancel-order-${o.id}`}
                            className="btn btn-outline-danger btn-sm rounded-0 catalog-see-more"
                            onClick={() => handleCancel(o.id)}
                          >
                            <i className="bi bi-x-circle me-1"></i>Hủy đơn hàng
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
