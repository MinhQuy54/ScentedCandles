import { useCallback, useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Switch, notification } from "antd";
import type { ProductCategory } from "../../api/types";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "../../api/admin-categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAdminCategories();
      setCategories(res.data || []);
    } catch {
      notification.error({
        message: "Không tải được danh sách danh mục",
        description: "Vui lòng thử lại sau.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function handleOpenCreateModal() {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      sortOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  }

  function handleOpenEditModal(category: ProductCategory) {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sortOrder: (category as any).sortOrder ?? 0,
      isActive: (category as any).isActive ?? true,
    });
    setIsModalOpen(true);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!editingCategory) {
      form.setFieldValue("slug", slugify(val));
    }
  }

  async function handleSubmitForm() {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, values);
        notification.success({
          message: "Cập nhật danh mục thành công",
          placement: "topRight",
          duration: 3,
        });
      } else {
        await createAdminCategory(values);
        notification.success({
          message: "Tạo danh mục mới thành công",
          placement: "topRight",
          duration: 3,
        });
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      if (err.errorFields) return; // Antd validation error
      notification.error({
        message: editingCategory ? "Cập nhật thất bại" : "Tạo thất bại",
        description: err?.message || "Vui lòng thử lại.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: ProductCategory) {
    const confirmed = window.confirm(
      `Xóa danh mục "${category.name}"? (xóa mềm)`,
    );
    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      await deleteAdminCategory(category.id);
      notification.success({
        message: "Đã xóa danh mục",
        placement: "topRight",
        duration: 3,
      });
      await loadCategories();
    } catch {
      notification.error({
        message: "Xóa danh mục thất bại",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="fw-bold mb-1 text-dark fs-5">
            Quản lý Danh mục
          </h1>
          <p className="text-muted small m-0">
            Phân loại sản phẩm, cấu hình slug và thứ tự hiển thị trên trang chủ.
          </p>
        </div>
        <button
          type="button"
          className="admin-action-btn admin-action-btn-primary"
          onClick={handleOpenCreateModal}
        >
          <i className="bi bi-plus-lg"></i> Thêm danh mục mới
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải danh mục...</span>
          </div>
        </div>
      ) : categories.length === 0 ? (

        <div className="admin-card p-5 text-center text-muted">
          <i className="bi bi-tags fs-1 text-muted opacity-50 mb-2"></i>
          <p className="mb-0">Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Slug tĩnh</th>
                  <th>Mô tả</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: any) => {
                  const isDeleted = Boolean(cat.deleted_at);

                  return (
                    <tr
                      key={cat.id}
                      className={isDeleted ? "admin-row-deleted" : undefined}
                    >
                      <td>
                        <div className="fw-semibold text-dark fs-6">{cat.name}</div>
                        {isDeleted && (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill mt-1">
                            Đã xóa mềm
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-monospace small text-muted bg-light px-2 py-1 rounded border">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="text-secondary small">{cat.description || "—"}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          #{cat.sortOrder ?? 0}
                        </span>
                      </td>
                      <td>
                        {cat.isActive !== false ? (
                          <span className="admin-badge-status admin-badge-delivered">
                            <i className="bi bi-eye-fill me-1"></i> Hiển thị
                          </span>
                        ) : (
                          <span className="admin-badge-status admin-badge-cancelled">
                            <i className="bi bi-eye-slash-fill me-1"></i> Ẩn
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn-outline"
                            onClick={() => handleOpenEditModal(cat)}
                          >
                            <i className="bi bi-pencil"></i> Sửa
                          </button>
                          {!isDeleted && (
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn-danger"
                              disabled={deletingId === cat.id}
                              onClick={() => void handleDelete(cat)}
                            >
                              <i className="bi bi-trash"></i>
                              {deletingId === cat.id ? "Đang xóa…" : "Xóa"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create/Edit Category */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-tag text-warning"></i>
            <span>{editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</span>
          </div>
        }
        open={isModalOpen}
        onOk={() => void handleSubmitForm()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-3">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="Ví dụ: Nến thơm cao cấp" onChange={handleNameChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (Đường dẫn tĩnh)"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}
          >
            <Input placeholder="nen-thom-cao-cap" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả danh mục">
            <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn về danh mục này…" />
          </Form.Item>

          <div className="row">
            <div className="col-6">
              <Form.Item name="sortOrder" label="Thứ tự ưu tiên">
                <InputNumber min={0} className="w-100" placeholder="0" />
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

