import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../../api/products";
import type { Product } from "../../api/types";
import { formatPrice, primaryImage } from "../../lib/products";
import { useClickOutsideClose } from "./useClickOutsideClose";

type NavSearchProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const SUGGEST_LIMIT = 5;

export function NavSearch({ open, onToggle, onClose }: NavSearchProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useClickOutsideClose(open, onClose);

  const q = query.trim();
  const showSuggest = open && q.length >= MIN_CHARS;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (!open || q.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setActiveIndex(-1);

    const timer = window.setTimeout(() => {
      void fetchProducts({
        page: 1,
        limit: SUGGEST_LIMIT,
        name: q,
        signal: controller.signal,
      })
        .then((res) => {
          setSuggestions(res.data.data);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, q]);

  const goToCatalog = () => {
    onClose();
    const next = new URLSearchParams();
    const categoryId = searchParams.get("categoryId");
    if (categoryId) next.set("categoryId", categoryId);
    if (q) next.set("q", q);
    const qs = next.toString();
    navigate(qs ? `/?${qs}` : "/");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      onClose();
      navigate(`/products/${suggestions[activeIndex].id}`);
      return;
    }
    goToCatalog();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggest || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
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
            onKeyDown={onKeyDown}
            tabIndex={open ? 0 : -1}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggest}
            aria-controls="search-suggest-list"
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

        {showSuggest && (
          <ul
            id="s1earch-suggest-list"
            className="search-suggest"
            role="listbox"
          >
            {loading && suggestions.length === 0 && (
              <li className="search-suggest-empty">Đang tìm...</li>
            )}
            {!loading && suggestions.length === 0 && (
              <li className="search-suggest-empty">Không tìm thấy sản phẩm</li>
            )}
            {suggestions.map((p, index) => {
              const onSale =
                Boolean(p.compareAtPrice) &&
                Number(p.compareAtPrice) > Number(p.price);
              return (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <Link
                    to={`/products/${p.id}`}
                    className={`search-suggest-item${index === activeIndex ? " is-active" : ""}`}
                    onClick={onClose}
                    tabIndex={open ? 0 : -1}
                  >
                    <div className="search-suggest-info">
                      <span className="search-suggest-name">{p.name}</span>
                      <span className="search-suggest-prices">
                        <span className="search-suggest-price">
                          {formatPrice(p.price)}
                        </span>
                        {onSale && (
                          <s className="search-suggest-compare">
                            {formatPrice(p.compareAtPrice!)}
                          </s>
                        )}
                      </span>
                    </div>
                    <img
                      className="search-suggest-thumb"
                      src={primaryImage(p)}
                      alt=""
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
