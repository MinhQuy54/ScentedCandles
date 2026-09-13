import { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import { fetchAdminProducts } from "../../api/admin-products";
import {
    adminDeleteProductImage,
    adminReorderProductImages,
    adminSetPrimaryImage,
    uploadAdminProductImage,
} from "../../api/admin-product-images";
import type { Product, ProductImage } from "../../api/types";

export function AdminProductImagesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        void loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const res = await fetchAdminProducts({ page: 1 });
            setProducts(res.data?.data || []);
        } catch {
            notification.error({ message: "Không tải được danh sách sản phẩm" });
        } finally {
            setLoading(false);
        }
    }

    async function handleSetPrimary(product: Product, imageId: string) {
        try {
            await adminSetPrimaryImage(product.id, imageId);
            notification.success({ message: "Đã cập nhật ảnh đại diện" });
            void loadProducts();
            if (selectedProduct?.id === product.id) {
                setSelectedProduct((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        images: prev.images?.map((img) => ({
                            ...img,
                            isPrimary: img.id === imageId,
                        })),
                    };
                });
            }
        } catch {
            notification.error({ message: "Cập nhật ảnh đại diện thất bại" });
        }
    }

    function handleDeleteImage(product: Product, imageId: string) {
        Modal.confirm({
            title: "Xác nhận xóa ảnh",
            content: "Bạn có chắc chắn muốn xóa ảnh sản phẩm này không?",
            okText: "Xóa",
            cancelText: "Hủy",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await adminDeleteProductImage(product.id, imageId);
                    notification.success({ message: "Đã xóa ảnh sản phẩm" });
                    void loadProducts();
                    if (selectedProduct?.id === product.id) {
                        setSelectedProduct((prev) => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                images: prev.images?.filter((img) => img.id !== imageId),
                            };
                        });
                    }
                } catch {
                    notification.error({ message: "Xóa ảnh thất bại" });
                }
            },
        });
    }

    async function handleUpload(product: Product, file: File) {
        try {
            setUploading(true);
            const isFirst = !product.images || product.images.length === 0;
            await uploadAdminProductImage(product.id, file, { isPrimary: isFirst });
            notification.success({ message: "Tải ảnh lên thành công" });
            await loadProducts();
        } catch {
            notification.error({ message: "Tải ảnh lên thất bại" });
        } finally {
            setUploading(false);
        }
    }

    async function handleMoveImage(product: Product, index: number, direction: 'up' | 'down') {
        if (!product.images) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= product.images.length) return;

        const newImages = [...product.images];
        const [moved] = newImages.splice(index, 1);
        newImages.splice(targetIndex, 0, moved);

        const newImageIds = newImages.map((img) => img.id);

        try {
            await adminReorderProductImages(product.id, newImageIds);
            notification.success({ message: "Đã cập nhật thứ tự hiển thị ảnh" });

            if (selectedProduct?.id === product.id) {
                setSelectedProduct({
                    ...selectedProduct,
                    images: newImages.map((img, idx) => ({ ...img, sortOrder: idx })),
                });
            }
            void loadProducts();
        } catch {
            notification.error({ message: "Sắp xếp thứ tự ảnh thất bại" });
        }
    }

    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h1 className="fw-bold mb-1 text-dark fs-5">Quản lý Ảnh Sản phẩm</h1>
                    <p className="text-muted small m-0">
                        Quản lý bộ sưu tập hình ảnh, tải lên, đặt ảnh đại diện (Primary) và sắp xếp thứ tự hiển thị cho sản phẩm.
                    </p>
                </div>
                <button
                    className="admin-action-btn admin-action-btn-outline"
                    onClick={() => void loadProducts()}
                >
                    <i className="bi bi-arrow-clockwise"></i> Làm mới
                </button>
            </div>

            {/* Search Bar */}
            <div className="admin-card mb-3 p-2 px-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="input-group input-group-sm" style={{ maxWidth: "300px" }}>
                        <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control bg-light border-start-0 ps-0"
                            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="text-muted small">Hiển thị {filtered.length} sản phẩm</span>
                </div>
            </div>

            {/* Products & Images Table */}
            {loading ? (
                <div className="p-4 text-center text-muted">Đang tải danh sách sản phẩm...</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card p-4 text-center text-muted">Không tìm thấy sản phẩm nào</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>SKU</th>
                                <th>Ảnh đại diện</th>
                                <th>Số lượng ảnh</th>
                                <th style={{ textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => {
                                const primaryImg = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                                const count = product.images?.length || 0;

                                return (
                                    <tr key={product.id}>
                                        <td className="fw-semibold">{product.name}</td>
                                        <td>
                                            <code className="text-secondary small">{product.sku}</code>
                                        </td>
                                        <td>
                                            {primaryImg ? (
                                                <img
                                                    src={primaryImg.url}
                                                    alt={primaryImg.altText || product.name}
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        objectFit: "cover",
                                                        borderRadius: 6,
                                                        border: "1px solid #e5e7eb",
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-muted small italic">Chưa có ảnh</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${count > 0 ? "bg-info-subtle text-info border border-info-subtle" : "bg-secondary bg-opacity-25 text-dark"}`}>
                                                {count} ảnh
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <label className="admin-action-btn admin-action-btn-outline mb-0" style={{ cursor: "pointer" }}>
                                                    <i className="bi bi-upload"></i> Tải ảnh
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        style={{ display: "none" }}
                                                        disabled={uploading}
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) void handleUpload(product, file);
                                                            e.target.value = "";
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    className="admin-action-btn admin-action-btn-primary"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    <i className="bi bi-images"></i> Quản lý thư viện
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Quản lý ảnh của sản phẩm */}
            {selectedProduct && (
                <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <h3 className="admin-modal-title">Thư viện ảnh sản phẩm</h3>
                                <p className="admin-modal-subtitle">
                                    {selectedProduct.name} · SKU: {selectedProduct.sku}
                                </p>
                            </div>
                            <button className="admin-modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
                        </div>

                        <div className="p-4">
                            {/* Upload zone inside modal */}
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded border">
                                <span className="small fw-semibold text-secondary">
                                    Tải thêm ảnh cho sản phẩm này (Tối đa 5MB / JPEG, PNG, WebP):
                                </span>
                                <label className="admin-action-btn admin-action-btn-primary mb-0" style={{ cursor: "pointer" }}>
                                    <i className="bi bi-cloud-upload"></i> Chọn tập tin
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        style={{ display: "none" }}
                                        disabled={uploading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) void handleUpload(selectedProduct, file);
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Images Grid */}
                            {!selectedProduct.images || selectedProduct.images.length === 0 ? (
                                <div className="text-center p-4 text-muted border rounded">
                                    Chưa có hình ảnh nào cho sản phẩm này. Hãy tải lên ảnh đầu tiên!
                                </div>
                            ) : (
                                <div className="row row-cols-2 row-cols-md-3 g-3">
                                    {selectedProduct.images.map((img: ProductImage, idx: number) => (
                                        <div key={img.id} className="col">
                                            <div className="card h-100 border shadow-sm position-relative overflow-hidden">
                                                <img
                                                    src={img.url}
                                                    alt={img.altText || selectedProduct.name}
                                                    className="card-img-top"
                                                    style={{ height: 160, objectFit: "cover" }}
                                                />
                                                {/* Top badges */}
                                                <div className="position-absolute top-0 start-0 m-2 d-flex gap-1">
                                                    <span className="badge bg-dark bg-opacity-75 text-white" style={{ fontSize: "11px" }}>
                                                        #{idx + 1}
                                                    </span>
                                                    {img.isPrimary && (
                                                        <span className="badge bg-danger shadow-sm" style={{ fontSize: "11px" }}>
                                                            ⭐ Ảnh chính
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="card-body p-2 d-flex flex-column justify-content-between gap-2">
                                                    {/* Move Up/Down Controls */}
                                                    <div className="d-flex justify-content-between align-items-center bg-light p-1 rounded border">
                                                        <span className="small text-muted px-1" style={{ fontSize: "11px" }}>Thứ tự:</span>
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary py-0 px-2"
                                                                style={{ fontSize: "11px" }}
                                                                disabled={idx === 0}
                                                                onClick={() => handleMoveImage(selectedProduct, idx, 'up')}
                                                                title="Di chuyển lên trước"
                                                            >
                                                                <i className="bi bi-arrow-left"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary py-0 px-2"
                                                                style={{ fontSize: "11px" }}
                                                                disabled={idx === selectedProduct.images!.length - 1}
                                                                onClick={() => handleMoveImage(selectedProduct, idx, 'down')}
                                                                title="Di chuyển xuống sau"
                                                            >
                                                                <i className="bi bi-arrow-right"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Primary / Delete Buttons */}
                                                    <div className="d-flex gap-1 justify-content-between">
                                                        {!img.isPrimary ? (
                                                            <button
                                                                className="btn btn-xs btn-outline-dark small py-1 px-2 flex-grow-1"
                                                                style={{ fontSize: "11px" }}
                                                                onClick={() => handleSetPrimary(selectedProduct, img.id)}
                                                            >
                                                                Đặt làm ảnh chính
                                                            </button>
                                                        ) : (
                                                            <span className="small text-success fw-bold py-1 px-1">Đang là ảnh chính</span>
                                                        )}
                                                        <button
                                                            className="btn btn-xs btn-outline-danger py-1 px-2"
                                                            style={{ fontSize: "11px" }}
                                                            onClick={() => handleDeleteImage(selectedProduct, img.id)}
                                                            title="Xóa ảnh này"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer p-3 border-top d-flex justify-content-end">
                            <button
                                className="admin-action-btn admin-action-btn-outline"
                                onClick={() => setSelectedProduct(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}