import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { fetchCategories } from "../api/categories";
import type { ProductCategory } from "../api/types";

export function AboutPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    void fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="about-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Giới thiệu</span>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <aside className="col-12 col-md-3">
            <div className="about-sidebar">
              <div className="about-logo-wrap">
                <img src={logo} alt="AuraScent" className="about-logo" />
              </div>
              <h6 className="about-sidebar-title">DANH MỤC TRANG</h6>
              <ul className="list-unstyled about-sidebar-list">
                <li>
                  <Link to="/">Tất cả sản phẩm</Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/?categoryId=${cat.id}`}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="col-12 col-md-9">
            <h1 className="about-heading">Giới thiệu</h1>

            <p className="about-lead">
              <strong>
                Nến thơm và tinh dầu — xu hướng sử dụng mùi hương cho không gian
                sống đang ngày càng trở nên phổ biến.
              </strong>
            </p>
            <p>
              <strong>AuraScent</strong> chuyên nến thơm và tinh dầu cao cấp,
              mang đến những giải pháp mùi hương tinh tế giúp nâng tầm không
              gian sống của bạn. Mỗi sản phẩm được tuyển chọn kỹ lưỡng từ nguồn
              nguyên liệu tự nhiên an toàn, tạo nên những tầng hương thanh lịch,
              dịu nhẹ và giàu cảm xúc.
            </p>

            <p>
              Chúng tôi tin rằng một làn hương phù hợp không chỉ làm đẹp ngôi
              nhà, mà còn là liệu pháp tinh thần giúp bạn giải tỏa căng thẳng và
              tìm lại sự cân bằng sau mỗi ngày làm việc.
            </p>

            <p>
              <strong>Chúng tôi cung cấp dịch vụ:</strong>
            </p>
            <ul>
              <li>Tư vấn chọn hương theo không gian và nhu cầu sử dụng</li>
              <li>Thiết kế set quà tặng cá nhân / doanh nghiệp</li>
              <li>Sản xuất theo yêu cầu (OEM) với số lượng lớn</li>
            </ul>

            <p>
              <strong>
                <em>Life is Better when you smell Nice</em>
              </strong>{" "}
              — chúng tôi tin rằng một làn hương phù hợp giúp bạn thư giãn và
              tận hưởng cuộc sống trọn vẹn hơn mỗi ngày.
            </p>

            <ul>
              <li>
                Facebook:{" "}
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  https://facebook.com
                </a>
              </li>
              <li>
                Instagram:{" "}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://instagram.com
                </a>
              </li>
              <li>
                Shopee:{" "}
                <a href="https://shopee.vn" target="_blank" rel="noreferrer">
                  https://shopee.vn
                </a>
              </li>
              <li>
                Hotline: <a href="tel:0325367066">0325.367.066</a>
              </li>
              <li>
                Showroom:
                <ul>
                  <li>
                    Tiền Giang: Ấp Đông Thạnh, Xã An Thái Đông, Huyện Cái Bè,
                    Tỉnh Tiền Giang
                  </li>
                </ul>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:accpesquy1245@gmail.com">
                  accpesquy1245@gmail.com
                </a>
              </li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  );
}
