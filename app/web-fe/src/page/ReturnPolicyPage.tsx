import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { fetchCategories } from "../api/categories";
import type { ProductCategory } from "../api/types";

export function ReturnPolicyPage() {
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
                    <span>Chính sách kiểm hàng và chính sách đổi trả</span>
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
                        <h1 className="about-heading mb-3">Chính sách kiểm hàng và chính sách đổi trả</h1>

                        {/* CHÍNH SÁCH KIỂM HÀNG */}
                        <div className="mb-4">
                            <p className="fw-bold text-uppercase mb-3" style={{ fontSize: "16px", color: "#111" }}>
                                CHÍNH SÁCH KIỂM HÀNG
                            </p>

                            <p>
                                <strong>Định nghĩa.</strong>
                            </p>
                            <p>
                                Kiểm hàng là thực hiện các công việc kiểm tra và so sánh các sản phẩm/hàng hóa nhận được trong kiện hàng mà chúng tôi gửi với các sản phẩm trong đơn hàng khách yêu cầu.
                            </p>

                            <p className="mt-3">
                                <strong>Quy định</strong>
                            </p>

                            <p className="fw-bold mb-1">Thời điểm kiểm hàng.</p>
                            <p>
                                Chúng tôi chấp nhận cho khách hàng đồng kiểm với nhân viên giao hàng tại thời điểm nhận hàng. Không hỗ trợ thử hàng.
                            </p>
                            <p>
                                Sau khi nhận hàng, khách hàng kiểm lại phát hiện sai, có thể liên lạc với bộ phận chăm sóc khách hàng để được hỗ trợ đổi trả. Lưu ý, quý khách quay video lúc mở thùng hàng để đối chiếu khi cần thiết.
                            </p>

                            <p className="fw-bold mt-3 mb-1">Phạm vi kiểm tra hàng hóa.</p>
                            <p>
                                Khách hàng được kiểm tra các sản phẩm thực nhận, đối chiếu, so sánh các sản phẩm nhận được với sản phẩm đã đặt trên đơn.
                            </p>

                            <p className="fw-bold mt-3 mb-1">Các bước xử lý khi hàng hóa nhận được không như đơn đặt hàng.</p>
                            <p>
                                Khi quý khách đồng kiểm, sản phẩm nhận được không như sản phẩm khách đặt trên đơn hàng. Xin hãy liên hệ với hotline <a href="tel:0325367066">032.536.7066</a> hoặc email <a href="mailto:ngominhquy15@gmail.com">ngominhquy15@gmail.com</a> để được gặp bộ phận chăm sóc khách hàng xác nhận lại đơn hàng.
                            </p>
                            <p>
                                Trường hợp chúng tôi đóng sai đơn hàng theo yêu cầu của khách, khách có thể không nhận hàng, không thanh toán. Trong trường hợp đơn hàng đã thanh toán, khách hàng có thể yêu cầu gửi lại đơn mới hoặc không, chúng tôi sẽ hoàn lại tiền cho quý khách trong thời gian sớm nhất.
                            </p>
                            <p>
                                Trường hợp chúng tôi đóng hàng đúng theo đơn hàng, nhưng khách hàng thay đổi nhu cầu, khách hàng có thể yêu cầu đổi trả và áp dụng chính sách đổi trả hàng hóa. Trường hợp này khách hàng sẽ thanh toán chi phí giao hàng (nếu có).
                            </p>
                        </div>

                        <div className="mb-4">
                            <p className="fw-bold text-uppercase mb-3" style={{ fontSize: "16px", color: "#111" }}>
                                CHÍNH SÁCH ĐỔI TRẢ
                            </p>

                            <p className="fw-bold mb-1">Điều kiện đổi trả</p>
                            <p>
                                Quý Khách hàng cần kiểm tra tình trạng hàng hóa và có thể đổi hàng/ trả lại hàng ngay tại thời điểm giao/nhận hàng trong những trường hợp sau:
                            </p>
                            <ul className="mb-3">
                                <li>Hàng không đúng chủng loại, mẫu mã trong đơn hàng đã đặt hoặc như trên website tại thời điểm đặt hàng.</li>
                                <li>Không đủ số lượng, không đủ bộ như trong đơn hàng.</li>
                                <li>Tình trạng sản phẩm bị ảnh hưởng như bong tróc, bể vỡ…</li>
                            </ul>
                            <p>
                                Khách hàng có trách nhiệm trình hình ảnh hoặc video chứng minh sự thiếu sót trên để hoàn thành việc hoàn trả/đổi trả hàng hóa.
                            </p>

                            <p className="fw-bold mt-3 mb-1">Quy định về thời gian thông báo và gửi sản phẩm đổi trả</p>
                            <ul>
                                <li>Thời gian thông báo đổi trả: trong vòng 48h kể từ khi nhận sản phẩm đối với trường hợp sản phẩm thiếu phụ kiện, quà tặng hoặc bể vỡ.</li>
                                <li>Thời gian gửi chuyển trả sản phẩm: trong vòng 14 ngày kể từ khi nhận sản phẩm.</li>
                                <li>Địa điểm đổi trả sản phẩm: Khách hàng có thể mang hàng trực tiếp đến văn phòng/ cửa hàng của chúng tôi hoặc chuyển qua đường bưu điện.</li>
                            </ul>
                            <p className="mt-2">
                                Trong trường hợp Quý Khách hàng có ý kiến đóng góp/khiếu nại liên quan đến chất lượng sản phẩm, Quý Khách hàng vui lòng liên hệ đường dây chăm sóc khách hàng của chúng tôi.
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}
