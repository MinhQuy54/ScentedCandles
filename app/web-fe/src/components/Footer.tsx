import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M14 13.5h2.5l.5-3H14v-1.9c0-.9.2-1.4 1.5-1.4H17V4.1C16.7 4.1 15.7 4 14.6 4 12.1 4 10.5 5.5 10.5 8.2V10.5H8v3h2.5V20h3.5v-6.5z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="footer-hotline py-3 ">
        <div className="container d-flex align-items-center gap-2">
          <span className="footer-phone-icon">
            <Phone size={14}></Phone>
          </span>
          <span>
            Hỗ trợ / Mua hàng:{" "}
            <a href="tel:0325367066" className="footer-hotline-number">
              0325.367.066
            </a>
          </span>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h5 className="footer-title">Giới thiệu</h5>
            <p className="footer-text">
              AuraScent chuyên nến thơm và tinh dầu cao cấp, mang đến những giải
              pháp mùi hương tinh tế giúp nâng tầm không gian sống của bạn. Mỗi
              sản phẩm tại AuraScent đều được tuyển chọn kỹ lưỡng từ nguồn
              nguyên liệu tự nhiên an toàn, tạo nên những tầng hương thanh lịch,
              dịu nhẹ và giàu cảm xúc. Chúng tôi tin rằng một làn hương phù hợp
              không chỉ làm đẹp cho ngôi nhà, mà còn là liệu pháp tinh thần
              tuyệt vời giúp bạn giải tỏa căng thẳng và tìm lại sự cân bằng sau
              mỗi ngày làm việc.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a
                href="https://www.facebook.com/mqn054"
                className="footer-social"
                aria-label="Facebook"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href="https://www.instagram.com/mqn.054/"
                className="footer-social"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="footer-title">Thông tin liên hệ</h5>
            <ul className="list-unstyled footer-contact">
              <li className="d-flex gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>
                  Store Tiền Giang: Ấp Đông Thạnh, Xã An Thái Đông, Huyện Cái
                  Bè, Tỉnh Tiền Giang
                </span>
              </li>
              <li className="d-flex gap-2">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <a href="tel:0325367066">0325.367.066</a>
              </li>
              <li className="d-flex gap-2">
                <Mail size={16} className="mt-1 flex-shrink-0" />
                <a href="mailto:accpesquy1245@gmail.com">
                  accpesquy1245@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h5 className="footer-title">Thông tin</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/about">Giới thiệu</Link>
              </li>
              <li>
                <Link to="/">Chính sách kiểm hàng và đổi trả</Link>
              </li>
              <li>
                <Link to="/">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/">Liên hệ</Link>
              </li>
              <li>
                <Link to="/">Chính sách thanh toán và vận chuyển</Link>
              </li>
              <li>
                <a href="https://shopee.vn" target="_blank" rel="noreferrer">
                  Gian hàng Shopee
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-copy">
        <div className="container text-center">
          Copyright © {new Date().getFullYear()} AuraScent — Nến thơm & tinh dầu
          cao cấp.
        </div>
      </div>
    </footer>
  );
}
