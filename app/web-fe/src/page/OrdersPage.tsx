import { useEffect, useState } from "react";
import { cancelOrder, getOrders } from "../api/orders";
import type { Order } from "../api/types";
import { formatPrice } from "../lib/products";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then(setOrders).catch(console.error);
  }, []);

  const handleCancel = async (id: string) => {
    if (confirm("Bạn muốn hủy đơn hàng này?")) {
      const updated = await cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>
      <h2 className="fw-bold mb-4 text-uppercase">Đơn hàng của tôi</h2>
      <div className="d-flex flex-column gap-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4 rounded-0 shadow-sm">
            <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
              <span className="fw-bold">Mã đơn: #{o.orderNumber}</span>
              <span className="badge bg-warning text-dark">{o.status}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div>Tổng tiền: <strong className="text-danger">{formatPrice(o.totalAmount)}</strong></div>
                <div className="small text-muted">Phương thức: {o.paymentMethod}</div>
              </div>
              {o.status === "PENDING" && (
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(o.id)}>
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
