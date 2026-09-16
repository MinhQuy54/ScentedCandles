import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { notification } from "antd";
import logo from "../assets/logo.png";
import { fetchCategories } from "../api/categories";
import type { ProductCategory } from "../api/types";

export function ContactPage() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void fetchCategories()
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !content.trim()) {
            notification.warning({
                message: "Thông tin chưa đầy đủ",
                description: "Vui lòng điền đầy đủ Tên, Email và Nội dung thắc mắc.",
                placement: "topRight",
            });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            notification.success({
                message: "Gửi thắc mắc thành công",
                description: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
                placement: "topRight",
            });
            setName("");
            setEmail("");
            setPhone("");
            setContent("");
        }, 600);
    }

    return (
        <div className="about-page pb-5">
            <div className="about-breadcrumb py-2 mb-4">
                <div className="container">
                    <Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link>
                    <span className="mx-2 text-muted">/</span>
                    <span className="fw-medium">Liên hệ</span>
                </div>
            </div>

            <div className="container">
                <div className="row g-4">
                    <aside className="col-12 col-md-3">
                        <div className="about-sidebar">
                            <div className="about-logo-wrap mb-3">
                                <img src={logo} alt="7senses Candle" className="about-logo img-fluid" />
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
                        <h1 className="about-heading mb-3">Liên hệ</h1>

                        <div className="contact-info-block mb-4 p-3 bg-light rounded border">
                            <p className="mb-2">
                                <strong>Địa chỉ của chúng tôi:</strong>{" "}
                                Ấp Đông Thạnh, Xã An Thái Đông, Huyện Cái Bè, Tỉnh Tiền Giang
                            </p>
                            <p className="mb-2">
                                <strong>Email của chúng tôi:</strong>{" "}
                                ngominhquy15@gmail.com
                            </p>
                            <p className="mb-0">
                                <strong>Điện thoại:</strong>{" "}
                                0325.367.066
                            </p>
                        </div>

                        <div className="pt-2">
                            <div className="row g-4">
                                <div className="col-12 col-xl-6">
                                    <div className="h-100 rounded overflow-hidden shadow-sm border" style={{ minHeight: "400px" }}>
                                        <iframe
                                            title="Trường Đại học Công nghệ Sài Gòn - STU"
                                            src="https://maps.google.com/maps?q=Saigon%20Technology%20University%2C%20180%20Cao%20L%E1%BB%95%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0, minHeight: "400px" }}
                                            allowFullScreen={false}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-xl-6">
                                    <div className="mb-4">
                                        <div className="text-secondary small mb-1 fw-medium">Thời gian làm việc</div>
                                        <div className="fw-bold fs-6 text-dark">Từ 8h đến 22h hàng ngày</div>
                                    </div>

                                    <div className="mb-3">
                                        <h2 className="fw-bold text-dark h4 mb-2">Gửi thắc mắc cho chúng tôi</h2>
                                    </div>

                                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                        <div>
                                            <input
                                                type="text"
                                                className="form-control form-control-custom"
                                                placeholder="Tên của bạn"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <input
                                                    type="email"
                                                    className="form-control form-control-custom"
                                                    placeholder="Email của bạn"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <input
                                                    type="tel"
                                                    className="form-control form-control-custom"
                                                    placeholder="Số điện thoại của bạn"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <textarea
                                                className="form-control form-control-custom"
                                                rows={4}
                                                placeholder="Nội dung"
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="small text-muted" style={{ fontSize: "13px" }}>
                                            This site is protected by reCAPTCHA and the Google{" "}
                                            <a
                                                href="https://policies.google.com/privacy"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary text-decoration-none"
                                            >
                                                Privacy Policy
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="https://policies.google.com/terms"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary text-decoration-none"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            apply.
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn catalog-see-more fw-bold px-4 py-3"
                                                style={{
                                                    backgroundColor: "#b02a2a",
                                                    borderRadius: "2px",
                                                    fontSize: "13px",
                                                    letterSpacing: "0.5px",
                                                    textTransform: "uppercase"
                                                }}
                                            >
                                                {loading ? "ĐANG GỬI..." : "GỬI CHO CHÚNG TÔI"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}


