import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orders";
import type { Address } from "../api/types";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/products";
import { notification } from "antd";
import { createAddress, getAddress } from "../api/addresses";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();


  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = totalPrice >= 990000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  useEffect(() => {
    getAddress()
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id);
        else setShowNewAddressForm(true);
      })
      .catch(() => setShowNewAddressForm(true));
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      const msg = "Giỏ hàng của bạn đang trống.";
      setError(msg);
      notification.warning({
        message: "Giỏ hàng trống",
        description: msg,
        placement: "topRight",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        note,
      };

      if (!showNewAddressForm && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        if (!recipientName || !phone || !streetAddress || !ward || !district || !city) {
          const msg = "Vui lòng nhập đầy đủ thông tin người nhận và địa chỉ giao hàng.";
          setError(msg);
          notification.error({
            message: "Thiếu thông tin địa chỉ",
            description: msg,
            placement: "topRight",
          });
          setLoading(false);
          return;
        }
        payload.recipientName = recipientName;
        payload.phone = phone;
        payload.streetAddress = streetAddress;
        payload.ward = ward;
        payload.district = district;
        payload.city = city;

        // Save address in background if user is logged in
        createAddress({
          recipientName,
          phone,
          streetAddress,
          ward,
          district,
          city,
          isDefault: addresses.length === 0,
        }).catch(() => null);
      }

      const order = await createOrder(payload);
      await clearCart();

      navigate(`/orders?success=true&orderNumber=${order.orderNumber}`);
    } catch (err: any) {
      const errorMsg = err.message || "Đặt hàng thất bại, sản phẩm có thể đã hết hàng.";
      setError(errorMsg);
      notification.error({
        message: "Đặt hàng thất bại",
        description: errorMsg,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "1100px" }}>
      <h4 className="fw-bold mb-4 text-uppercase fs-4">Thanh toán đơn hàng</h4>
      {error && <div className="alert alert-danger mb-4 small">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card p-4 mb-4 rounded-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold m-0 fs-6">1. Địa chỉ giao hàng</h6>
              {addresses.length > 0 && (
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none small text-danger"
                  style={{ fontSize: "15px" }}
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                >
                  {showNewAddressForm ? "Chọn địa chỉ có sẵn" : "+ Thêm địa chỉ mới"}
                </button>
              )}
            </div>

            {!showNewAddressForm && addresses.length > 0 ? (
              <div>
                {addresses.map((addr) => (
                  <div key={addr.id} className="form-check mb-3 p-3 border rounded-0">
                    <input
                      className="form-check-input ms-0 me-2"
                      type="radio"
                      name="addrRadio"
                      id={`addr-${addr.id}`}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <label className="form-check-label ms-1 small" htmlFor={`addr-${addr.id}`}>
                      <strong>{addr.recipientName}</strong> ({addr.phone})
                      <div className="text-muted small">
                        {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.city}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Họ tên người nhận</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Họ và Tên"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder=""
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Phường/Xã</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Quận/Huyện</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-0"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>


          <div className="card p-4 mb-4 rounded-0 shadow-sm">
            <h6 className="fw-bold mb-3 fs-6">2. Phương thức thanh toán</h6>
            <div className="form-check mb-3 p-3 border rounded-0">
              <input
                className="form-check-input ms-0 me-2"
                type="radio"
                name="paymentMethod"
                id="pay-cod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <label className="form-check-label fw-semibold ms-1 small" htmlFor="pay-cod">
                Thanh toán khi nhận hàng (COD)
              </label>
            </div>

            <div className="form-check p-3 border rounded-0">
              <input
                className="form-check-input ms-0 me-2"
                type="radio"
                name="paymentMethod"
                id="pay-bank"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={() => setPaymentMethod("BANK_TRANSFER")}
              />
              <label className="form-check-label fw-semibold ms-1 small" htmlFor="pay-bank">
                Chuyển khoản ngân hàng / VietQR
              </label>

              {paymentMethod === "BANK_TRANSFER" && (
                <div className="vietqr-box bg-light p-3 border rounded mt-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white p-3 border rounded text-center shadow-sm flex-shrink-0" style={{ width: 110 }}>
                      <i className="bi bi-qr-code-scan fs-1 text-danger"></i>
                      <div className="fw-bold text-dark mt-1" style={{ fontSize: "11px" }}>VietQR SePAY</div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-danger mb-1 fs-6">Thanh toán chuyển khoản tự động</h6>
                      <p className="small text-muted mb-2">
                        Quý khách vui lòng nhấn <strong>ĐẶT HÀNG NGAY</strong> bên dưới để tạo đơn hàng. Mã QR chính thức kèm <strong>Mã đơn hàng (ORD-XXXXXX-XXX)</strong> sẽ hiển thị ngay lập tức để quét thanh toán.
                      </p>
                      <span className="badge bg-success text-white">
                        <i className="bi bi-shield-check me-1"></i>Hệ thống tự động xác nhận qua SePAY trong 3s
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-4 rounded-0 shadow-sm">
            <h6 className="fw-bold mb-2 fs-6">3. Ghi chú đơn hàng (Tùy chọn)</h6>
            <textarea
              className="form-control form-control-sm rounded-0"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm cho người giao hàng..."
            ></textarea>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card p-4 bg-light rounded-0 shadow-sm sticky-top" style={{ top: "80px" }}>
            <h6 className="fw-bold mb-3 border-bottom pb-2 fs-6">Tóm tắt đơn hàng</h6>
            <div className="d-flex justify-content-between mb-2 small">
              <span>Tạm tính:</span>
              <span className="fw-bold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 small">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4 fs-6 fw-bold text-danger">
              <span>Tổng tiền:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            <button
              className="btn catalog-see-more w-100 py-2 fw-bold text-uppercase small"
              disabled={loading}
              onClick={handlePlaceOrder}
            >
              {loading ? "Đang xử lý..." : "ĐẶT HÀNG NGAY"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
