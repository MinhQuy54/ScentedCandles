import { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import {
    deleteAdminUser,
    fetchAdminUsers,
    updateAdminUserRole,
    updateAdminUserStatus,
    type AdminUser,
} from "../../api/admin-users";

export function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "customer" | "admin" | "active" | "locked">("all");

    useEffect(() => {
        void loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            const res = await fetchAdminUsers();
            const list = Array.isArray(res.data) ? res.data : (res as any)?.data || [];
            setUsers(list);
        } catch {
            notification.error({ message: "Không tải được danh sách người dùng" });
        } finally {
            setLoading(false);
        }
    }

    function handleToggleStatus(user: AdminUser) {
        const nextStatus = !user.isActive;
        const actionText = nextStatus ? "Mở khóa" : "Khóa";
        Modal.confirm({
            title: `Xác nhận ${actionText} tài khoản`,
            content: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản ${user.email}?`,
            okText: actionText,
            cancelText: "Hủy",
            okButtonProps: { danger: !nextStatus },
            onOk: async () => {
                try {
                    await updateAdminUserStatus(user.id, nextStatus);
                    notification.success({ message: `Đã ${actionText.toLowerCase()} tài khoản` });
                    void loadUsers();
                } catch {
                    notification.error({ message: `Thao tác thất bại` });
                }
            },
        });
    }

    function handleChangeRole(user: AdminUser) {
        const nextRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
        const roleLabel = nextRole === "ADMIN" ? "Quản trị viên (ADMIN)" : "Khách hàng (CUSTOMER)";
        Modal.confirm({
            title: `Xác nhận đổi vai trò`,
            content: `Bạn có chắc chắn muốn đổi vai trò của ${user.fullName || user.email} sang "${roleLabel}"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await updateAdminUserRole(user.id, nextRole);
                    notification.success({ message: `Đã đổi vai trò sang ${nextRole}` });
                    void loadUsers();
                } catch {
                    notification.error({ message: `Đổi vai trò thất bại` });
                }
            },
        });
    }

    function handleDeleteUser(user: AdminUser) {
        Modal.confirm({
            title: "Xác nhận xóa tài khoản",
            content: `Bạn có chắc chắn muốn xóa vĩnh viễn/vô hiệu hóa tài khoản ${user.email}?`,
            okText: "Xóa",
            cancelText: "Hủy",
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await deleteAdminUser(user.id);
                    notification.success({ message: "Đã xóa tài khoản" });
                    void loadUsers();
                } catch {
                    notification.error({ message: "Xóa tài khoản thất bại" });
                }
            },
        });
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q);

        const matchFilter =
            filter === "all" ||
            (filter === "customer" && u.role === "CUSTOMER") ||
            (filter === "admin" && u.role === "ADMIN") ||
            (filter === "active" && u.isActive) ||
            (filter === "locked" && !u.isActive);

        return matchSearch && matchFilter;
    });

    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "ADMIN").length;
    const customerCount = users.filter((u) => u.role === "CUSTOMER").length;
    const lockedCount = users.filter((u) => !u.isActive).length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h1 className="fw-bold mb-1 text-dark fs-5">Quản lý Người dùng</h1>
                    <p className="text-muted small m-0">
                        Danh sách tài khoản khách hàng, quản trị viên và phân quyền truy cập hệ thống.
                    </p>
                </div>
                <button
                    className="admin-action-btn admin-action-btn-outline"
                    onClick={() => void loadUsers()}
                >
                    <i className="bi bi-arrow-clockwise"></i> Làm mới
                </button>
            </div>

            {/* KPI Cards */}
            <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                    <div className="admin-kpi-icon brand">
                        <i className="bi bi-people"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value">{totalUsers}</div>
                        <div className="admin-kpi-label">Tổng tài khoản</div>
                    </div>
                </div>

                <div
                    className="admin-kpi-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("customer")}
                >
                    <div className="admin-kpi-icon sky">
                        <i className="bi bi-person"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value">{customerCount}</div>
                        <div className="admin-kpi-label">Khách hàng</div>
                    </div>
                </div>

                <div
                    className="admin-kpi-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("admin")}
                >
                    <div className="admin-kpi-icon amber">
                        <i className="bi bi-shield-lock"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value text-danger">{adminCount}</div>
                        <div className="admin-kpi-label">Quản trị viên</div>
                    </div>
                </div>

                <div
                    className="admin-kpi-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("locked")}
                >
                    <div className="admin-kpi-icon brand">
                        <i className="bi bi-lock"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value text-warning">{lockedCount}</div>
                        <div className="admin-kpi-label">Tài khoản bị khóa</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="admin-card mb-3 p-2 px-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div className="d-flex flex-wrap gap-1">
                        {[
                            { key: "all", label: "Tất cả", count: totalUsers },
                            { key: "customer", label: "Khách hàng", count: customerCount },
                            { key: "admin", label: "Quản trị viên", count: adminCount },
                            { key: "locked", label: "Bị khóa", count: lockedCount },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`btn btn-sm rounded-pill px-2 py-1 small fw-semibold ${
                                    filter === tab.key
                                        ? "btn-dark shadow-sm"
                                        : "btn-light text-secondary border-0"
                                }`}
                                onClick={() => setFilter(tab.key as any)}
                            >
                                {tab.label}{" "}
                                <span
                                    className={`badge rounded-pill ms-1 ${
                                        filter === tab.key
                                            ? "bg-danger text-white"
                                            : "bg-secondary bg-opacity-25 text-dark"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="input-group input-group-sm" style={{ maxWidth: "260px" }}>
                        <span className="input-group-text bg-light border-end-0">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control bg-light border-start-0 ps-0"
                            placeholder="Tìm theo tên, email, SĐT..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="p-4 text-center text-muted">Đang tải dữ liệu người dùng...</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card p-4 text-center text-muted">Không tìm thấy người dùng nào</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Họ & Tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th style={{ textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u.id}>
                                    <td className="fw-semibold text-dark">
                                        {u.fullName || "Chưa cập nhật"}
                                    </td>
                                    <td>
                                        <span className="small">{u.email}</span>
                                    </td>
                                    <td>
                                        <span className="text-secondary small">{u.phone || "—"}</span>
                                    </td>
                                    <td>
                                        {u.role === "ADMIN" ? (
                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                                                <i className="bi bi-shield-check me-1"></i> ADMIN
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">
                                                CUSTOMER
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {u.isActive ? (
                                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                                                Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-muted small">
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className="d-flex gap-1 justify-content-end">
                                            <button
                                                className="admin-action-btn admin-action-btn-outline"
                                                onClick={() => handleChangeRole(u)}
                                                title="Đổi vai trò người dùng"
                                            >
                                                <i className="bi bi-person-badge"></i> Đổi role
                                            </button>
                                            <button
                                                className={`admin-action-btn ${u.isActive ? "admin-action-btn-danger" : "admin-action-btn-success"}`}
                                                onClick={() => handleToggleStatus(u)}
                                                title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                            >
                                                <i className={`bi ${u.isActive ? "bi-lock" : "bi-unlock"}`}></i> {u.isActive ? "Khóa" : "Mở khóa"}
                                            </button>
                                            <button
                                                className="admin-action-btn admin-action-btn-danger"
                                                onClick={() => handleDeleteUser(u)}
                                                title="Xóa tài khoản"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}