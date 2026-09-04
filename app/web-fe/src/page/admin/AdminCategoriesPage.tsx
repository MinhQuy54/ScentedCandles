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
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-heading">Quản lý danh mục</h1>
          <p className="admin-lead">Tạo, cập nhật và sắp xếp danh mục sản phẩm AuraScent.</p>
        </div>
        <button
          type="button"
          className="btn auth-submit"
          onClick={handleOpenCreateModal}
        >
          + Thêm danh mục
        </button>
      </div>

      {loading ? (
        <p className="text-muted py-4">Đang tải danh mục…</p>
      ) : categories.length === 0 ? (
        <p className="text-muted py-4">Chưa có danh mục nào.</p>
      ) : (
        <div className="table-responsive admin-table-wrap">
          <table className="table admin-table align-middle">
            <thead>
              <tr>
                <th>Tên danh mục</th>
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
                      <div className="admin-product-name">{cat.name}</div>
                      {isDeleted && (
                        <span className="admin-badge admin-badge-muted">
                          Đã xóa
                        </span>
                      )}
                    </td>
                    <td>{cat.description || "—"}</td>
                    <td>{cat.sortOrder ?? 0}</td>
                    <td>
                      {cat.isActive !== false ? (
                        <span className="admin-badge admin-badge-active">
                          Đang bật
                        </span>
                      ) : (
                        <span className="admin-badge admin-badge-inactive">
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleOpenEditModal(cat)}
                        >
                          Sửa
                        </button>
                        {!isDeleted && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={deletingId === cat.id}
                            onClick={() => void handleDelete(cat)}
                          >
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
      )}

      {/* Modal Create/Edit Category */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
    </>
  );
}
