import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 8;

const CATEGORIES = ['Tất cả', 'Giày', 'Áo', 'Quần', 'Túi', 'Điện tử', 'Đồng hồ', 'Phụ kiện', 'Gia dụng', 'Làm đẹp', 'Sách'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        _page: currentPage,
        _limit: ITEMS_PER_PAGE,
      };

      if (search) params.name_like = search;
      if (category !== 'Tất cả') params.category = category;

      // Sorting
      if (sortBy === 'price-asc') { params._sort = 'price'; params._order = 'asc'; }
      else if (sortBy === 'price-desc') { params._sort = 'price'; params._order = 'desc'; }
      else if (sortBy === 'name-asc') { params._sort = 'name'; params._order = 'asc'; }

      const res = await api.get('/products', { params });
      setProducts(res.data);
      const total = parseInt(res.headers['x-total-count'] || 0, 10);
      setTotalProducts(total);
    } catch {
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, category, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Khám phá <span style={{ color: 'var(--accent)' }}>sản phẩm</span> của chúng tôi
        </h1>
        <p style={styles.heroSub}>
          Hàng trăm sản phẩm chính hãng, giao hàng nhanh toàn quốc
        </p>
      </div>

      {/* Search & Sort */}
      <div style={styles.toolbar}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Tìm
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setSearch(''); setSearchInput(''); setCurrentPage(1); }}
            >
              ✕ Xóa
            </button>
          )}
        </form>

        <select className="form-select" value={sortBy} onChange={handleSortChange} style={{ minWidth: 160 }}>
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
          <option value="name-asc">Tên: A → Z</option>
        </select>
      </div>

      {/* Category filter */}
      <div style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              ...styles.catBtn,
              ...(category === cat ? styles.catBtnActive : {}),
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        {search && (
          <span>Kết quả cho "<strong style={{ color: 'var(--accent)' }}>{search}</strong>"</span>
        )}
        {!loading && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 'auto' }}>
            {totalProducts} sản phẩm · Trang {currentPage}/{totalPages || 1}
          </span>
        )}
      </div>

      {/* Content */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h3>Không tìm thấy sản phẩm</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

const styles = {
  hero: {
    textAlign: 'center',
    padding: '20px 0 40px',
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 12,
  },
  heroSub: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  categories: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  catBtn: {
    padding: '6px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  },
  catBtnActive: {
    background: 'var(--accent)',
    color: '#0a0a12',
    borderColor: 'var(--accent)',
    fontWeight: 700,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    minHeight: 24,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 20,
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--text-secondary)',
  },
};