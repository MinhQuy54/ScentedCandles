import { useEffect, useRef, useState } from "react";
import { notification } from "antd";
import {
    adjustAdminStock,
    fetchAdminInventory,
    fetchInventoryTransactions,
    updateAdminStock,
} from "../../api/admin-inventory";
import type { InventoryItem, InventoryTransaction } from "../../api/types";

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function txTypeBadge(type: string) {
    const map: Record<string, string> = {
        RESERVE: "badge-warning",
        RELEASE: "badge-info",
        ORDER: "badge-danger",
        ADJUSTMENT: "badge-primary",
        RETURN: "badge-success",
        MANUAL: "badge-secondary",
    };
    const labels: Record<string, string> = {
        RESERVE: "Giữ chỗ",
        RELEASE: "Hủy giữ chỗ",
        ORDER: "Xuất kho",
        ADJUSTMENT: "Điều chỉnh",
        RETURN: "Hoàn trả",
        MANUAL: "Thủ công",
    };
    return (
        <span className={`admin-badge ${map[type] ?? "badge-secondary"}`}>
            {labels[type] ?? type}
        </span>
    );
}
interface AdjustModalProps {
    item: InventoryItem;
    onClose: () => void;
    onDone: () => void;
}

function AdjustModal({ item, onClose, onDone }: AdjustModalProps) {
    const [mode, setMode] = useState<"set" | "adjust">("adjust");
    const [qty, setQty] = useState(0);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const available = item.quantityOnHand - item.quantityReserved;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isNaN(qty)) return;
        setLoading(true);
        try {
            if (mode === "set") {
                await updateAdminStock(item.productId, qty, note || undefined);
                notification.success({ message: "Đã đặt số lượng kho" });
            } else {
                await adjustAdminStock(item.productId, qty, note || undefined);
                notification.success({ message: qty > 0 ? "Đã nhập kho" : "Đã xuất kho" });
            }
            onDone();
        } catch {
            notification.error({ message: "Thao tác thất bại, vui lòng thử lại" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div>
                        <h3 className="admin-modal-title">Điều chỉnh tồn kho</h3>
                        <p className="admin-modal-subtitle">{item.product?.name} · SKU: {item.product?.sku}</p>
                    </div>
                    <button className="admin-modal-close" onClick={onClose}>✕</button>
                </div>


                <div className="inv-stat-row">
                    <div className="inv-stat-card">
                        <span className="inv-stat-label">Tồn kho</span>
                        <span className="inv-stat-value">{item.quantityOnHand}</span>
                    </div>
                    <div className="inv-stat-card">
                        <span className="inv-stat-label">Đang giữ</span>
                        <span className="inv-stat-value text-warning">{item.quantityReserved}</span>
                    </div>
                    <div className="inv-stat-card">
                        <span className="inv-stat-label">Khả dụng</span>
                        <span className={`inv-stat-value ${available > 0 ? "text-success" : "text-danger"}`}>
                            {available}
                        </span>
                    </div>
                </div>

                <div className="inv-mode-toggle">
                    <button
                        className={`inv-mode-btn ${mode === "adjust" ? "active" : ""}`}
                        onClick={() => setMode("adjust")}
                    >
                        ± Điều chỉnh (+/-)
                    </button>
                    <button
                        className={`inv-mode-btn ${mode === "set" ? "active" : ""}`}
                        onClick={() => setMode("set")}
                    >
                        = Đặt số lượng
                    </button>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            {mode === "adjust"
                                ? "Số lượng thay đổi (dương = nhập, âm = xuất)"
                                : "Số lượng tồn kho mới"}
                        </label>
                        <input
                            ref={inputRef}
                            type="number"
                            className="admin-form-input"
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            min={mode === "set" ? 0 : undefined}
                            required
                        />
                        {mode === "adjust" && qty !== 0 && (
                            <p className="admin-form-hint">
                                {qty > 0
                                    ? `✓ Nhập thêm ${qty} → Tồn kho mới: ${item.quantityOnHand + qty}`
                                    : `↓ Xuất ${Math.abs(qty)} → Tồn kho mới: ${item.quantityOnHand + qty}`}
                            </p>
                        )}
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Ghi chú (tuỳ chọn)</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="VD: Nhập hàng lô tháng 9..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {mode === "adjust" && (
                        <div className="inv-quick-btns">
                            {[10, 25, 50, 100].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className="inv-quick-btn"
                                    onClick={() => setQty((prev) => prev + n)}
                                >
                                    +{n}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="admin-modal-footer">
                        <button type="button" className="admin-btn-ghost" onClick={onClose}>
                            Huỷ
                        </button>
                        <button type="submit" className="admin-btn-primary" disabled={loading}>
                            {loading ? "Đang lưu..." : "Xác nhận"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface TxModalProps {
    item: InventoryItem;
    onClose: () => void;
}

function TxModal({ item, onClose }: TxModalProps) {
    const [txs, setTxs] = useState<InventoryTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await fetchInventoryTransactions(item.productId);
                setTxs(res.data || []);
            } catch {
                notification.error({ message: "Không tải được lịch sử giao dịch" });
            } finally {
                setLoading(false);
            }
        })();
    }, [item.productId]);

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <div>
                        <h3 className="admin-modal-title">Lịch sử giao dịch kho</h3>
                        <p className="admin-modal-subtitle">{item.product?.name}</p>
                    </div>
                    <button className="admin-modal-close" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="admin-loading"><div className="admin-spinner" /></div>
                ) : txs.length === 0 ? (
                    <div className="admin-empty">Chưa có giao dịch nào</div>
                ) : (
                    <div className="admin-table-container" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Loại</th>
                                    <th style={{ textAlign: "right" }}>Thay đổi</th>
                                    <th style={{ textAlign: "right" }}>Tồn sau</th>
                                    <th>Ghi chú</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {txs.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{txTypeBadge(tx.type)}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className={tx.quantityChange >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                {tx.quantityChange >= 0 ? "+" : ""}{tx.quantityChange}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>{tx.quantityAfter}</td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                                            {tx.note || "—"}
                                        </td>
                                        <td style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>
                                            {formatDate(tx.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export function AdminInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
    const [txTarget, setTxTarget] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<"all" | "low" | "out">("all");

    useEffect(() => { void loadData(); }, []);

    async function loadData() {
        try {
            setLoading(true);
            const res = await fetchAdminInventory();
            const list = Array.isArray(res) ? res : (res as any)?.data || [];
            setItems(list);
        } catch {
            notification.error({ message: "Không tải được danh sách tồn kho" });
        } finally {
            setLoading(false);
        }
    }

    /* filter + search */
    const filtered = items.filter((item) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            item.product?.name?.toLowerCase().includes(q) ||
            item.product?.sku?.toLowerCase().includes(q);

        const available = item.quantityOnHand - item.quantityReserved;
        const matchFilter =
            filter === "all" ||
            (filter === "out" && available <= 0) ||
            (filter === "low" && available > 0 && available <= item.lowStockThreshold);

        return matchSearch && matchFilter;
    });

    const totalOnHand = items.reduce((s, i) => s + i.quantityOnHand, 0);
    const outOfStock = items.filter((i) => i.quantityOnHand - i.quantityReserved <= 0).length;
    const lowStock = items.filter((i) => {
        const av = i.quantityOnHand - i.quantityReserved;
        return av > 0 && av <= i.lowStockThreshold;
    }).length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h1 className="fw-bold mb-1 text-dark fs-5">Quản lý Tồn kho</h1>
                    <p className="text-muted small m-0">
                        Kiểm soát số lượng thực tế, giữ chỗ và lịch sử biến động kho.
                    </p>
                </div>
                <button
                    className="admin-action-btn admin-action-btn-outline"
                    onClick={() => void loadData()}
                >
                    <i className="bi bi-arrow-clockwise"></i> Làm mới
                </button>
            </div>

            {/* KPI Cards */}
            <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                    <div className="admin-kpi-icon brand">
                        <i className="bi bi-box-seam"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value">{totalOnHand.toLocaleString()}</div>
                        <div className="admin-kpi-label">Tổng tồn kho ({items.length} SP)</div>
                    </div>
                </div>

                <div
                    className="admin-kpi-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("low")}
                >
                    <div className="admin-kpi-icon amber">
                        <i className="bi bi-exclamation-triangle"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value text-warning">{lowStock}</div>
                        <div className="admin-kpi-label">Sắp hết hàng</div>
                    </div>
                </div>

                <div
                    className="admin-kpi-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter("out")}
                >
                    <div className="admin-kpi-icon brand">
                        <i className="bi bi-x-circle"></i>
                    </div>
                    <div>
                        <div className="admin-kpi-value text-danger">{outOfStock}</div>
                        <div className="admin-kpi-label">Hết hàng</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="admin-card mb-3 p-2 px-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div className="d-flex flex-wrap gap-1">
                        {[
                            { key: "all", label: "Tất cả", count: items.length },
                            { key: "low", label: "Sắp hết", count: lowStock },
                            { key: "out", label: "Hết hàng", count: outOfStock },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`btn btn-sm rounded-pill px-2 py-1 small fw-semibold ${filter === tab.key
                                    ? "btn-dark shadow-sm"
                                    : "btn-light text-secondary border-0"
                                    }`}
                                onClick={() => setFilter(tab.key as any)}
                            >
                                {tab.label}{" "}
                                <span
                                    className={`badge rounded-pill ms-1 ${filter === tab.key
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
                            placeholder="Tìm theo tên hoặc SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="p-4 text-center text-muted">Đang tải dữ liệu...</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card p-4 text-center text-muted">Không tìm thấy dữ liệu tồn kho</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>SKU</th>
                                <th style={{ textAlign: "right" }}>Tồn kho</th>
                                <th style={{ textAlign: "right" }}>Đang giữ</th>
                                <th style={{ textAlign: "right" }}>Khả dụng</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => {
                                const available = item.quantityOnHand - item.quantityReserved;
                                const isOut = available <= 0;
                                const isLow = !isOut && available <= item.lowStockThreshold;
                                return (
                                    <tr key={item.id}>
                                        <td className="fw-semibold">
                                            {item.product?.name ?? "—"}
                                        </td>
                                        <td>
                                            <code className="text-secondary small">
                                                {item.product?.sku ?? "—"}
                                            </code>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                                            {item.quantityOnHand}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="text-warning">
                                                {item.quantityReserved}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 700 }}>
                                            <span className={isOut ? "text-danger" : isLow ? "text-warning" : "text-success"}>
                                                {available}
                                            </span>
                                        </td>
                                        <td>
                                            {isOut ? (
                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Hết hàng</span>
                                            ) : isLow ? (
                                                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Sắp hết</span>
                                            ) : (
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Còn hàng</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <button
                                                    className="admin-action-btn admin-action-btn-outline"
                                                    onClick={() => setTxTarget(item)}
                                                    title="Xem lịch sử giao dịch"
                                                >
                                                    <i className="bi bi-clock-history"></i> Lịch sử
                                                </button>
                                                <button
                                                    className="admin-action-btn admin-action-btn-primary"
                                                    onClick={() => setAdjustTarget(item)}
                                                    title="Điều chỉnh số lượng kho"
                                                >
                                                    <i className="bi bi-pencil-square"></i> Điều chỉnh
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

            {/* Modals */}
            {adjustTarget && (
                <AdjustModal
                    item={adjustTarget}
                    onClose={() => setAdjustTarget(null)}
                    onDone={() => {
                        setAdjustTarget(null);
                        void loadData();
                    }}
                />
            )}
            {txTarget && (
                <TxModal
                    item={txTarget}
                    onClose={() => setTxTarget(null)}
                />
            )}
        </div>

    );
}
