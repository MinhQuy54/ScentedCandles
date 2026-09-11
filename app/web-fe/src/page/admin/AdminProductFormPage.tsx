import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import { notification } from "antd";
import type { ProductCategory, ProductImage } from "../../api/types";
import { fetchCategories } from "../../api/categories";
import {
  createAdminProduct,
  fetchAdminProduct,
  updateAdminProduct,
} from "../../api/admin-products";
import { uploadAdminProductImage } from "../../api/admin-product-images";

const PRODUCT_STATUSES = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Ngừng bán" },
];

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data);
        if (!isEdit && res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      } catch {
        notification.error({
          message: "Không tải được danh mục",
          placement: "topRight",
          duration: 3,
        });
      }
    })();
  }, [isEdit]);

  useEffect(() => {
    if (!id) return;

    void (async () => {
      try {
        setLoading(true);
        const res = await fetchAdminProduct(id);
        const product = res.data;
        setCategoryId(product.categoryId);
        setName(product.name);
        setSlug(product.slug);
        setSku(product.sku);
        setShortDescription(product.shortDescription ?? "");
        setRawDescription(product.rawDescription);
        setPrice(String(Number(product.price)));
        setStatus(product.status);
        setIsFeatured(product.isFeatured);
        setImages(product.images ?? []);
        setSlugTouched(true);
      } catch {
        notification.error({
          message: "Không tải được sản phẩm",
          placement: "topRight",
          duration: 3,
        });
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      categoryId,
      name: name.trim(),
      slug: slug.trim() || slugify(name.trim()),
      ...(sku.trim() ? { sku: sku.trim() } : {}),
      shortDescription: shortDescription.trim(),
      rawDescription: rawDescription.trim(),
      price: Number(price),
      status,
      isFeatured,
    };

    try {
      if (isEdit && id) {
        await updateAdminProduct(id, payload);
        notification.success({
          message: "Đã cập nhật sản phẩm",
          placement: "topRight",
          duration: 3,
        });
      } else {
        const res = await createAdminProduct(payload);
        notification.success({
          message: "Đã tạo sản phẩm",
          description: "Bạn có thể upload ảnh ở bước tiếp theo.",
          placement: "topRight",
          duration: 3,
        });
        navigate(`/admin/products/${res.data.id}/edit`);
      }
    } catch {
      notification.error({
        message: isEdit ? "Cập nhật thất bại" : "Tạo sản phẩm thất bại",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(file: File) {
    if (!id) return;

    setUploading(true);
    try {
      await uploadAdminProductImage(id, file, {
        altText: name.trim() || undefined,
        isPrimary: images.length === 0,
      });
      const res = await fetchAdminProduct(id);
      setImages(res.data.images ?? []);
      notification.success({
        message: "Upload ảnh thành công",
        placement: "topRight",
        duration: 3,
      });
    } catch {
      notification.error({
        message: "Upload ảnh thất bại",
        description: "Chỉ hỗ trợ JPEG, PNG, WebP (tối đa 5MB).",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Đang tải sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link to="/admin/products" className="text-secondary text-decoration-none small fw-semibold">
          <i className="bi bi-arrow-left"></i> Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="admin-card p-4 p-md-5 mb-4">
        <h1 className="fw-bold mb-1 text-dark" style={{ fontSize: "22px" }}>
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
        <p className="text-muted small mb-4">
          {isEdit
            ? "Cập nhật thông tin chi tiết, giá bán và upload bộ sưu tập ảnh."
            : "Điền thông tin cơ bản, sau đó tải ảnh sản phẩm lên hệ thống."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="product-name" className="form-label auth-label">
                Tên sản phẩm *
              </label>
              <input
                id="product-name"
                type="text"
                className="form-control auth-input"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="product-slug" className="form-label auth-label">
                Slug (Đường dẫn tĩnh) *
              </label>
              <input
                id="product-slug"
                type="text"
                className="form-control auth-input font-monospace small"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                required
                disabled={saving}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="product-category" className="form-label auth-label">
                Danh mục *
              </label>
              <select
                id="product-category"
                className="form-select auth-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={saving || categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">Chưa có danh mục</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="product-sku" className="form-label auth-label">
                Mã SKU
              </label>
              <input
                id="product-sku"
                type="text"
                className="form-control auth-input font-monospace small"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Tự sinh nếu để trống"
                disabled={saving}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="product-price" className="form-label auth-label">
                Giá bán (VND) *
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                step={1000}
                className="form-control auth-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="product-status" className="form-label auth-label">
                Trạng thái hiển thị
              </label>
              <select
                id="product-status"
                className="form-select auth-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
              >
                {PRODUCT_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check mb-2 bg-light p-2 px-3 rounded border w-100">
                <input
                  id="product-featured"
                  type="checkbox"
                  className="form-check-input"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="product-featured" className="form-check-label auth-label mb-0 ms-1 cursor-pointer">
                  Đánh dấu là Sản phẩm nổi bật (Featured)
                </label>
              </div>
            </div>

            <div className="col-12">
              <label htmlFor="product-short-desc" className="form-label auth-label">
                Mô tả ngắn
              </label>
              <input
                id="product-short-desc"
                type="text"
                className="form-control auth-input"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                disabled={saving}
                placeholder="Ví dụ: Hương thơm gỗ tuyết tùng thư giãn phòng ngủ..."
              />
            </div>

            <div className="col-12">
              <label htmlFor="product-desc" className="form-label auth-label">
                Mô tả chi tiết *
              </label>
              <textarea
                id="product-desc"
                className="form-control auth-input"
                rows={6}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                required
                disabled={saving}
                placeholder="Mô tả kỹ hơn về các tầng hương, thành phần sáp nến, thời gian cháy..."
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Link to="/admin/products" className="admin-action-btn admin-action-btn-outline">
              Hủy bỏ
            </Link>
            <button
              type="submit"
              className="admin-action-btn admin-action-btn-primary px-4"
              disabled={saving || !categoryId}
            >
              <i className="bi bi-check-lg"></i>
              {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>

      {isEdit && (
        <div className="admin-card p-4 p-md-5">
          <h2 className="fw-bold mb-1 text-dark" style={{ fontSize: "18px" }}>
            <i className="bi bi-images text-warning me-2"></i> Bộ sưu tập ảnh sản phẩm
          </h2>
          <p className="text-muted small mb-4">
            Định dạng hỗ trợ: JPEG, PNG, WebP — Kích thước đề xuất 1000x1000px, tối đa 5MB mỗi ảnh.
          </p>

          {images.length > 0 && (
            <div className="d-flex flex-wrap gap-3 mb-4">
              {images.map((image) => (
                <div key={image.id} className="position-relative">
                  <img
                    src={image.url}
                    alt={image.altText ?? name}
                    className="rounded-3 border shadow-sm"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  />
                  {image.isPrimary && (
                    <span className="position-absolute bottom-0 start-0 m-1 badge bg-warning text-dark font-semibold shadow-sm">
                      Ảnh chính
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <label className="d-inline-block cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="d-none"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <span className="admin-action-btn admin-action-btn-outline px-4 py-2">
              <i className="bi bi-cloud-upload"></i>
              {uploading ? "Đang tải ảnh lên…" : "+ Tải ảnh mới lên"}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

