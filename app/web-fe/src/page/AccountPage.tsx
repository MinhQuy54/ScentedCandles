import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input, Modal, Popconfirm, Spin, notification } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  createAddress,
  deleteAddress,
  getAddress,
  setDefaultAddress,
  updateAddress,
} from "../api/addresses";
import type { Address } from "../api/types";

export function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      setLoading(true);
      const data = await getAddress();
      setAddresses(data);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Lỗi tải địa chỉ",
        description: "Không thể lấy danh sách địa chỉ. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    notification.success({
      message: "Đã đăng xuất",
      description: "Hẹn gặp lại bạn tại AuraScent!",
      placement: "topRight",
      duration: 3,
    });
    navigate("/");
  }

  function handleOpenAddModal() {
    setEditingAddress(null);
    form.resetFields();
    if (addresses.length === 0) {
      form.setFieldsValue({ isDefault: true });
    }
    setIsModalOpen(true);
  }

  function handleOpenEditModal(addr: Address) {
    setEditingAddress(addr);
    form.setFieldsValue({
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetAddress: addr.streetAddress,
      ward: addr.ward,
      district: addr.district,
      city: addr.city,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  }

  async function handleSaveAddress(values: any) {
    try {
      setSubmitting(true);
      if (editingAddress) {
        await updateAddress(editingAddress.id, values);
        notification.success({
          message: "Cập nhật thành công",
          description: "Địa chỉ đã được cập nhật thành công.",
        });
      } else {
        await createAddress(values);
        notification.success({
          message: "Thêm địa chỉ thành công",
          description: "Địa chỉ mới đã được lưu vào sổ địa chỉ.",
        });
      }
      setIsModalOpen(false);
      form.resetFields();
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Lưu địa chỉ thất bại",
        description: "Vui lòng kiểm tra lại thông tin và thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAddress(id);
      notification.success({
        message: "Đã xóa địa chỉ",
        description: "Địa chỉ đã được xóa khỏi sổ địa chỉ.",
      });
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Xóa thất bại",
        description: "Không thể xóa địa chỉ. Vui lòng thử lại.",
      });
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress(id);
      notification.success({
        message: "Cập nhật thành công",
        description: "Địa chỉ đã được đặt làm mặc định.",
      });
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Lỗi cập nhật",
        description: "Không thể đặt địa chỉ này làm mặc định.",
      });
    }
  }

  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="about-breadcrumb py-2">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="mx-1">/</span>
          <span>Tài khoản</span>
        </div>
      </div>

      <div className="container py-5">
        <div className="account-grid">
          <div className="account-card">
            <h1 className="auth-heading fs-4">Tài khoản của tôi</h1>
            <p className="auth-lead fs-6 mb-4">Xin chào, {user.fullName}</p>

            <dl className="account-dl">
              <div className="account-dl-row">
                <dt>Họ tên</dt>
                <dd>{user.fullName}</dd>
              </div>
              <div className="account-dl-row">
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="account-dl-row">
                <dt>Số điện thoại</dt>
                <dd>{user.phone || "Chưa cập nhật"}</dd>
              </div>
              <div className="account-dl-row">
                <dt>Vai trò</dt>
                <dd>{user.role ?? "CUSTOMER"}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="btn w-100 catalog-see-more"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>

          {/* Address Book Section */}
          <div className="address-book-card">
            <div className="address-book-header">
              <h2 className="address-book-title">Sổ địa chỉ giao hàng</h2>
              <Button
                type="primary"
                style={{ backgroundColor: "#a8383a", borderColor: "#a8383a" }}
                onClick={handleOpenAddModal}
              >
                <i className="bi bi-plus-lg me-1"></i> Thêm địa chỉ mới
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spin tip="Đang tải danh sách địa chỉ..." />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-3">Bạn chưa có địa chỉ giao hàng nào được lưu.</p>
                <Button
                  type="dashed"
                  onClick={handleOpenAddModal}
                >
                  <i className="bi bi-plus-lg me-1"></i> Thêm địa chỉ ngay
                </Button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card-item ${addr.isDefault ? "is-default" : ""}`}
                  >
                    <div className="address-card-head">
                      <div>
                        <span className="address-card-name">{addr.recipientName}</span>
                        <span className="address-card-phone">({addr.phone})</span>
                      </div>
                      {addr.isDefault && (
                        <span className="badge-default">Mặc định</span>
                      )}
                    </div>

                    <div className="address-card-text">
                      {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.city}
                    </div>

                    <div className="address-card-actions">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="address-action-btn btn-set-default"
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          <i className="bi bi-star me-1"></i> Thiết lập mặc định
                        </button>
                      )}

                      <button
                        type="button"
                        className="address-action-btn"
                        onClick={() => handleOpenEditModal(addr)}
                      >
                        <i className="bi bi-pencil-square me-1"></i> Chỉnh sửa
                      </button>

                      <Popconfirm
                        title="Xóa địa chỉ"
                        description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
                        onConfirm={() => handleDelete(addr.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <button type="button" className="address-action-btn btn-delete">
                          <i className="bi bi-trash me-1"></i> Xóa
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <Modal
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAddress}
          className="mt-3"
        >
          <Form.Item
            name="recipientName"
            label="Họ và tên người nhận"
            rules={[{ required: true, message: "Vui lòng nhập tên người nhận!" }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input placeholder="Ví dụ: 0912345678" />
          </Form.Item>

          <Form.Item
            name="streetAddress"
            label="Địa chỉ chi tiết (Số nhà, Tên đường...)"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết!" }]}
          >
            <Input placeholder="Ví dụ: 123 Nguyễn Thị Minh Khai" />
          </Form.Item>

          <div className="row">
            <div className="col-md-4">
              <Form.Item
                name="ward"
                label="Phường / Xã"
                rules={[{ required: true, message: "Vui lòng nhập Phường/Xã!" }]}
              >
                <Input placeholder="Phường Đa Kao" />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item
                name="district"
                label="Quận / Huyện"
                rules={[{ required: true, message: "Vui lòng nhập Quận/Huyện!" }]}
              >
                <Input placeholder="Quận 1" />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item
                name="city"
                label="Tỉnh / Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập Tỉnh/Thành phố!" }]}
              >
                <Input placeholder="TP. Hồ Chí Minh" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox disabled={editingAddress?.isDefault}>
              Đặt làm địa chỉ mặc định
            </Checkbox>
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ backgroundColor: "#a8383a", borderColor: "#a8383a" }}
            >
              {editingAddress ? "Cập nhật" : "Lưu địa chỉ"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
