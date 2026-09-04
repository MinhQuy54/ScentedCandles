import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProduct, fetchProducts } from "../api/products";
import type { Product } from "../api/types";
import { discountPercent, formatPrice, primaryImage } from "../lib/products";
import { notification } from "antd";
import { ProductCard } from "../components/ProductCard";
import { CandleUsageGuide } from "../components/CandleUsageGuide";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchProduct(id);
        const currentProduct = res.data;
        setProduct(currentProduct);
        setSelectedImage(primaryImage(currentProduct));

        if (currentProduct.categoryId) {
          const relatedRes = await fetchProducts({
            categoryId: currentProduct.categoryId,
            limit: 4,
          });
          setRelatedProducts(
            relatedRes.data.data.filter((item) => item.id !== currentProduct.id)
          );
        }
      } catch {
        setError("Không tìm thấy sản phẩm");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  function handleAddToCart() {
    notification.success({
      message: "Đã thêm vào giỏ hàng",
      description: `Đã thêm ${quantity} x ${product?.name} vào giỏ hàng của bạn.`,
      placement: "topRight",
      duration: 3,
    });
  }

  if (loading) {
    return (
      <p className="container py-5 text-center text-muted">
        Đang tải chi tiết sản phẩm...
      </p>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger mb-3">{error || "Sản phẩm không tồn tại"}</p>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          ← Quay lại catalog
        </Link>
      </div>
    );
  }

  const percent = discountPercent(product);
  const images = product.images || [];

  return (
    <div className="product-detail-page pb-5">
      {/* BREADCRUMB */}
      <div className="bg-light py-2 mb-4 border-bottom">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small" style={{ fontSize: "13px" }}>
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-muted">
                  Trang chủ
                </Link>
              </li>
              {product.category && (
                <li className="breadcrumb-item">
                  <Link
                    to={`/?categoryId=${product.category.id}`}
                    className="text-decoration-none text-muted"
                  >
                    {product.category.name}
                  </Link>
                </li>
              )}
              <li
                className="breadcrumb-item active text-dark fw-medium"
                aria-current="page"
              >
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1200px" }}>
        <div className="row g-lg-5 align-items-start">
          <div
            className="col-lg-6 col-md-6 position-sticky"
            style={{ maxWidth: "580px", top: "90px", alignSelf: "flex-start" }}
          >
            <div className="d-flex gap-2">

              {images.length > 1 && (
                <div
                  className="d-flex flex-column gap-2"
                  style={{ width: "60px", flexShrink: 0 }}
                >
                  {images.map((img) => {
                    const isSelected = selectedImage === img.url;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        className={`btn p-0 border ${isSelected ? "border-dark border-2" : "border-light"
                          }`}
                        style={{
                          width: "60px",
                          height: "60px",
                          overflow: "hidden",
                          borderRadius: "0px",
                        }}
                        onClick={() => setSelectedImage(img.url)}
                      >
                        <img
                          src={img.url}
                          alt={img.altText || product.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex-grow-1">
                <div
                  className="position-relative overflow-hidden bg-light"
                  style={{ aspectRatio: "1/1", width: "100%" }}
                >
                  <img
                    src={selectedImage || primaryImage(product)}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <h1
              className="fw-bold mb-1"
              style={{ fontSize: "1.25rem", color: "#111", lineHeight: 1.35 }}
            >
              {product.name}
            </h1>
            <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
              SKU:{product.sku}
            </p>

            <hr className="my-3 text-muted opacity-25" />

            <div className="d-flex align-items-baseline gap-3 mb-3">
              <span className="fw-bold" style={{ color: "#d61114", fontSize: "1.35rem" }}>
                {formatPrice(product.price)}
              </span>
              {percent !== null && product.compareAtPrice && (
                <>
                  <span className="text-muted text-decoration-line-through small">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="badge bg-danger small">-{percent}%</span>
                </>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="input-group" style={{ width: "120px" }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary border-0 bg-light fw-bold btn-sm"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center bg-light border-0 fw-semibold small py-1"
                  value={quantity}
                  readOnly
                  style={{ fontSize: "14px" }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary border-0 bg-light fw-bold btn-sm"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn catalog-see-more w-50 py-2.5 mb-4 fw-bold text-uppercase"
              style={{
                background: "#a8383a",
                borderRadius: "0px",
                letterSpacing: "0.05em",
                fontSize: "0.85rem",
              }}
              onClick={handleAddToCart}
            >
              THÊM VÀO GIỎ
            </button>

            <div className="product-description-section mt-3">
              {product.shortDescription && (
                <>
                  <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: "16px" }}>
                    MÔ TẢ
                  </h6>
                  <p
                    className="text-secondary mb-3"
                    style={{ fontSize: "14px", lineHeight: "1.6" }}
                  >
                    {product.shortDescription}
                  </p>
                </>
              )}
              <div className="mt-4">
                <h3 className="fw-bold mb-2 text-dark" style={{ fontSize: "16px" }}>
                  THÔNG TIN SẢN PHẨM:
                </h3>
                {product.rawDescription.trim().startsWith('<') ? (
                  <div
                    className="product-description text-secondary"
                    style={{ fontSize: "14px", lineHeight: "1.7" }}
                    dangerouslySetInnerHTML={{ __html: product.rawDescription }}
                  />
                ) : (
                  <div className="product-description text-secondary" style={{ fontSize: "14px", lineHeight: "1.0" }}>
                    <ul className="list-unstyled mb-0">
                      {product.rawDescription.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        const cleanLine = trimmed.replace(/^[•\-\*\s]+/, '').trim();
                        if (trimmed.toUpperCase().startsWith('THÔNG TIN SẢN PHẨM')) {
                          return (
                            <li key={idx} className="fw-bold text-dark mt-3 mb-2" style={{ fontSize: "14px", letterSpacing: "0.03em" }}>
                              {trimmed}
                            </li>
                          );
                        }
                        return (
                          <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                            <span style={{ color: '#333', fontSize: '1rem', lineHeight: '1.4' }}>•</span>
                            <span style={{ flex: 1 }}>{cleanLine}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <CandleUsageGuide />
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-5 pt-5 border-top">
            <h3 className="h4 fw-bold mb-4 text-center text-uppercase">
              Có thể bạn cũng thích
            </h3>
            <div className="row g-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}