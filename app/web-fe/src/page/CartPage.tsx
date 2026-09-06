import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/products";

export function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-3" style={{ fontSize: "18px" }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-muted mb-4 small" style={{ fontSize: "13px" }}>
          Hãy khám phá bộ sưu tập nến thơm và tinh dầu ngay!
        </p>
        <Link
          to="/"
          className="btn px-4 py-2 catalog-see-more text-uppercase"
          style={{ background: "#a8383a", fontSize: "13px", letterSpacing: "0.05em" }}
        >
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "1300px" }}>
      <h1
        className="fw-bold mb-4 text-uppercase text-dark"
        style={{ fontSize: "25px", letterSpacing: "0.03em" }}
      >
        Giỏ hàng ({totalItems})
      </h1>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="table-responsive border-top">
            <table className="table align-middle" style={{ fontSize: "14px" }}>
              <thead>
                <tr className="small text-uppercase text-muted" style={{ fontSize: "13px" }}>
                  <th style={{ width: "45%" }}>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th className="text-end">Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <div className="d-flex gap-3 align-items-center">
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          style={{ width: "55px", height: "55px", objectFit: "cover" }}
                        />
                        <div>
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-decoration-none text-dark fw-semibold"
                            style={{ fontSize: "16px" }}
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-muted" style={{ fontSize: "13px" }}>
                            SKU: {item.product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-medium" style={{ fontSize: "16px" }}>
                      {formatPrice(item.product.price)}
                    </td>
                    <td>
                      <div className="input-group" style={{ width: "90px" }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm border-0 bg-light py-0 px-2"
                          style={{ fontSize: "12px" }}
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="form-control form-control-sm text-center bg-light border-0 py-0 px-1 fw-medium"
                          style={{ fontSize: "14px" }}
                          value={item.quantity}
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm border-0 bg-light py-0 px-2"
                          style={{ fontSize: "12px" }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-end fw-bold" style={{ fontSize: "16px" }}>
                      {formatPrice(item.lineTotal)}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 border-0"
                        style={{ fontSize: "14px" }}
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card p-4 border-0 bg-light rounded-0" style={{ fontSize: "13px" }}>
            <h6
              className="fw-bold mb-3 text-uppercase text-dark"
              style={{ fontSize: "16px", letterSpacing: "0.03em" }}
            >
              Tóm tắt đơn hàng
            </h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tạm tính:</span>
              <span className="fw-semibold">{formatPrice(totalPrice)}</span>
            </div>
            <hr className="my-2" />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold text-dark">Tổng cộng:</span>
              <span className="fw-bold text-danger" style={{ fontSize: "16px" }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="btn catalog-see-more w-100 py-2 fw-bold text-uppercase text-center text-decoration-none"
              style={{ background: "#a8383a", borderRadius: "0", fontSize: "0.82rem", letterSpacing: "0.05em" }}
            >
              TIẾP TỤC THANH TOÁN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
