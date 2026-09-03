import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Product, ProductCategory } from "../api/types";
import { fetchProducts } from "../api/products";
import { fetchCategories } from "../api/categories";
import { ProductCard } from "../components/ProductCard";

type CatalogSection = {
  category: ProductCategory;
  products: Product[];
};

function CatalogSectionTitle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2
      ref={ref}
      className={`catalog-section-title mb-4${visible ? " is-visible" : ""}`}
    >
      {children}
    </h2>
  );
}

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";

  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSearch = Boolean(q);
  const isSingleCategory = Boolean(categoryId) && !isSearch;
  const isGroupedHome = !isSearch && !categoryId;

  useEffect(() => {
    void fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchProducts({
          page: 1,
          limit: isGroupedHome ? 100 : 20,
          ...(q ? { name: q } : {}),
          ...(categoryId ? { categoryId } : {}),
        });
        setItems(res.data.data);
      } catch {
        setError("LOAD_PRODUCT_FAILED");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [q, categoryId, isGroupedHome]);

  const sections: CatalogSection[] = useMemo(() => {
    if (isSearch) return [];

    const sourceCategories = categoryId
      ? categories.filter((c) => c.id === categoryId)
      : categories;

    return sourceCategories
      .map((category) => ({
        category,
        products: items.filter((p) => p.categoryId === category.id),
      }))
      .filter((section) => section.products.length > 0);
  }, [categories, items, categoryId, isSearch]);

  if (loading) return <p className="container py-5">Đang tải…</p>;

  if (error) return <p className="container py-5">{error}</p>;

  if (isSearch) {
    return (
      <section className="container py-5">
        <CatalogSectionTitle>Kết quả: “{q}”</CatalogSectionTitle>
        {items.length === 0 ? (
          <p className="text-center text-muted">
            Không tìm thấy sản phẩm cho “{q}”
          </p>
        ) : (
          <div className="row g-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (sections.length === 0) {
    return (
      <section className="container py-5">
        <p className="text-center text-muted">
          {isSingleCategory
            ? "Danh mục này chưa có sản phẩm."
            : "Chưa có sản phẩm nào."}
        </p>
      </section>
    );
  }

  return (
    <div className="catalog-page py-4">
      {sections.map(({ category, products }) => (
        <section key={category.id} className="container catalog-section py-4">
          <CatalogSectionTitle>{category.name}</CatalogSectionTitle>
          <div className="row g-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {isGroupedHome && (
            <div className="text-center mt-4">
              <Link
                to={`/?categoryId=${category.id}`}
                className="btn catalog-see-more"
              >
                Xem thêm
              </Link>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
