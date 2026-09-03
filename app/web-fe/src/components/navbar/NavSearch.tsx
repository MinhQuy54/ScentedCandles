import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useClickOutsideClose } from "./useClickOutsideClose";

type NavSearchProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function NavSearch({ open, onToggle, onClose }: NavSearchProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useClickOutsideClose(open, onClose);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    onClose();

    const next = new URLSearchParams();
    const categoryId = searchParams.get("categoryId");
    if (categoryId) next.set("categoryId", categoryId);
    if (q) next.set("q", q);

    const qs = next.toString();
    navigate(qs ? `/?${qs}` : "/");
  };

  return (
    <div className="nav-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className="nav-icon border-0 bg-transparent p-0"
        aria-label="Tìm kiếm"
        aria-expanded={open}
        onClick={onToggle}
      >
        <i className="bi bi-search" aria-hidden />
      </button>

      <div
        className={`nav-popover nav-popover--search${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="nav-popover-title">TÌM KIẾM</div>
        <form className="search-popover-form" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="search"
            className="search-popover-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            tabIndex={open ? 0 : -1}
          />
          <button
            type="submit"
            className="search-popover-submit"
            aria-label="Tìm"
            tabIndex={open ? 0 : -1}
          >
            <i className="bi bi-search" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
