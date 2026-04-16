import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS = [
  { value: 'active',  label: '● Hoạt động', color: 'var(--success)', bg: 'var(--success-muted)' },
  { value: 'pending', label: '● Chờ duyệt',  color: 'var(--accent)',  bg: 'var(--accent-muted)'  },
  { value: 'banned',  label: '● Bị khóa',    color: 'var(--danger)',  bg: 'var(--danger-muted)'  },
];

const getStatus = (v) => STATUS_OPTIONS.find(s => s.value === v) || STATUS_OPTIONS[0];

export default function AdminShops() {
  const [shops, setShops]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [detailShop, setDetailShop]   = useState(null); // shop detail modal
  const [shopProducts, setShopProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast]             = useState('');

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const params = { _page: page, _limit: ITEMS_PER_PAGE };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.name_like = search;
      const res = await api.get('/shops', { params });
      setShops(res.data);
      setTotal(parseInt(res.headers['x-total-count'] || 0, 10));
    } catch { showToast('❌ Không thể tải danh sách cửa hàng.'); }
    finally { setLoading(false); }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  /* ---- Open shop detail & load its products ---- */
  const openDetail = async (shop) => {
    setDetailShop(shop);
    setProductsLoading(true);
    try {
      const res = await api.get(`/products?shopId=${shop.id}`);
      setShopProducts(res.data);
    } catch { setShopProducts([]); }
    finally { setProductsLoading(false); }
  };

  /* ---- Change shop status ---- */
  const changeStatus = async (shop, newStatus) => {
    try {
      const res = await api.patch(`/shops/${shop.id}`, { status: newStatus });
      setShops(prev => prev.map(s => s.id === shop.id ? res.data : s));
      if (detailShop?.id === shop.id) setDetailShop(res.data);
      showToast(`✅ Đã cập nhật trạng thái cửa hàng!`);
    } catch { showToast('❌ Cập nhật thất bại.'); }
  };

  /* ---- Delete shop (and its products) ---- */
  const handleDelete = async (shop) => {
    try {
      // Delete all products of this shop first
      const prods = await api.get(`/products?shopId=${shop.id}`);
      await Promise.all(prods.data.map(p => api.delete(`/products/${p.id}`)));
      // Delete shop
      await api.delete(`/shops/${shop.id}`);
      setDeleteConfirm(null);
      setDetailShop(null);
      showToast(`✅ Đã xóa cửa hàng "${shop.name}"!`);
      if (shops.length === 1 && page > 1) setPage(p => p - 1);
      else fetchShops();
    } catch { showToast('❌ Xóa thất bại.'); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const totalByStatus = (s) => shops.filter(x => x.status === s).length;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

      {toast && <div style={st.toast}>{toast}</div>}

      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 className="page-title">🏪 Quản lý Cửa hàng</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {total} cửa hàng đã đăng ký
          </p>
        </div>

        {/* Stat cards */}
        <div style={st.statCards}>
          {STATUS_OPTIONS.map(opt => (
            <div key={opt.value} style={{ ...st.statCard, background: opt.bg, border: `1px solid ${opt.color}30` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: opt.color }}>
                {shops.filter(s => s.status === opt.value).length}
              </div>
              <div style={{ fontSize: '0.75rem', color: opt.color, fontWeight: 600 }}>{opt.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={st.toolbar}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input className="form-input" placeholder="🔍 Tìm tên cửa hàng..."
            value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-secondary">Tìm</button>
          {search && (
            <button type="button" className="btn btn-ghost"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>✕</button>
          )}
        </form>

        {/* Status filter tabs */}
        <div style={st.filterTabs}>
          {[{ value: 'all', label: 'Tất cả' }, ...STATUS_OPTIONS].map(opt => (
            <button key={opt.value}
              style={{
                ...st.filterTab,
                ...(filterStatus === opt.value ? {
                  background: opt.color || 'var(--accent)',
                  color: opt.value === 'all' ? '#0a0a12' : opt.color ? 'white' : '#0a0a12',
                  borderColor: opt.color || 'var(--accent)',
                } : {}),
              }}
              onClick={() => { setFilterStatus(opt.value); setPage(1); }}
            >
              {opt.label || 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : shops.length === 0 ? (
        <div style={st.empty}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏪</div>
          <p>Không tìm thấy cửa hàng nào.</p>
        </div>
      ) : (
        <div style={st.grid}>
          {shops.map(shop => {
            const status = getStatus(shop.status);
            return (
              <div key={shop.id} style={st.shopCard}>
                {/* Card header */}
                <div style={st.cardTop}>
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.name} style={st.logo}
                      onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div style={st.logoFallback}>{shop.name[0]}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shop.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      ID #{shop.id} · {shop.category}
                    </div>
                  </div>
                </div>

                <p style={st.desc}>{shop.description || 'Chưa có mô tả'}</p>

                {/* Status badge */}
                <div style={{ marginBottom: 14 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                    color: status.color, background: status.bg,
                  }}>
                    {status.label}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {shop.createdAt}
                  </span>
                </div>

                {/* Actions */}
                <div style={st.cardActions}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                    onClick={() => openDetail(shop)}>
                    👁 Xem chi tiết
                  </button>

                  {/* Quick status change */}
                  {shop.status !== 'active' && (
                    <button className="btn btn-sm" style={{ flex: 1,
                      background: 'var(--success-muted)', color: 'var(--success)',
                      border: '1px solid rgba(16,185,129,0.3)' }}
                      onClick={() => changeStatus(shop, 'active')}>
                      ✓ Duyệt
                    </button>
                  )}
                  {shop.status !== 'banned' && (
                    <button className="btn btn-sm" style={{ flex: 1,
                      background: 'var(--danger-muted)', color: 'var(--danger)',
                      border: '1px solid rgba(239,68,68,0.3)' }}
                      onClick={() => changeStatus(shop, 'banned')}>
                      🚫 Khóa
                    </button>
                  )}
                  {shop.status !== 'pending' && (
                    <button className="btn btn-sm" style={{ flex: 1,
                      background: 'var(--accent-muted)', color: 'var(--accent)',
                      border: '1px solid rgba(245,158,11,0.3)' }}
                      onClick={() => changeStatus(shop, 'pending')}>
                      ⏳ Chờ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages}
        onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      {/* ===== Shop Detail Modal ===== */}
      {detailShop && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailShop(null)}>
          <div className="modal-box" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2 className="modal-title">🏪 Chi tiết cửa hàng</h2>
              <button className="modal-close" onClick={() => setDetailShop(null)}>✕</button>
            </div>

            {/* Shop info */}
            <div style={st.detailTop}>
              {detailShop.logo ? (
                <img src={detailShop.logo} alt={detailShop.name} style={st.detailLogo}
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div style={{ ...st.logoFallback, width: 64, height: 64, fontSize: '1.8rem' }}>
                  {detailShop.name[0]}
                </div>
              )}
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>
                  {detailShop.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                  {detailShop.description || 'Chưa có mô tả'}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>🏷 {detailShop.category}</span>
                  <span>📅 {detailShop.createdAt}</span>
                  <span>🆔 ID: #{detailShop.id}</span>
                  <span>👤 OwnerID: #{detailShop.ownerId}</span>
                </div>
              </div>
            </div>

            {/* Status control */}
            <div style={{ marginBottom: 20 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>Trạng thái cửa hàng</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', border: `1px solid ${opt.color}40`,
                      background: detailShop.status === opt.value ? opt.color : opt.bg,
                      color: detailShop.status === opt.value ? 'white' : opt.color,
                      fontFamily: 'var(--font-body)',
                      transition: 'var(--transition)',
                    }}
                    onClick={() => changeStatus(detailShop, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            {/* Products list */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                📦 Sản phẩm ({shopProducts.length})
              </div>
              {productsLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : shopProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chưa có sản phẩm nào.</p>
              ) : (
                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {shopProducts.map(p => (
                    <div key={p.id} style={st.productRow}>
                      <img src={p.image} alt={p.name} style={st.productThumb}
                        onError={e => e.target.style.display = 'none'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.88rem' }}>
                          {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(p.price)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Kho: {p.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-danger"
                onClick={() => { setDeleteConfirm(detailShop); }}>
                🗑 Xóa cửa hàng
              </button>
              <button className="btn btn-secondary" onClick={() => setDetailShop(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm ===== */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
              <h2 style={{ marginBottom: 8, fontFamily: 'var(--font-display)' }}>Xóa cửa hàng?</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Cửa hàng <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirm.name}"</strong> và
                toàn bộ sản phẩm của nó sẽ bị xóa vĩnh viễn.
              </p>
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8 }}>
                ⚠ Không thể hoàn tác!
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                🗑 Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const st = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap',
  },
  statCards: { display: 'flex', gap: 10, flexShrink: 0 },
  statCard: {
    padding: '10px 16px', borderRadius: 'var(--radius-lg)',
    textAlign: 'center', minWidth: 80,
  },
  toolbar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  filterTabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterTab: {
    padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border)',
    background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'var(--font-body)',
    transition: 'var(--transition)',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16,
  },
  shopCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '20px',
    display: 'flex', flexDirection: 'column', transition: 'var(--transition)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  logo: { width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 },
  logoFallback: {
    width: 48, height: 48, borderRadius: 'var(--radius-md)',
    background: 'var(--accent)', color: '#0a0a12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', fontWeight: 800, flexShrink: 0,
  },
  desc: {
    fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
    marginBottom: 12, flex: 1,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardActions: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' },
  detailTop: {
    display: 'flex', gap: 16, alignItems: 'flex-start',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 20,
  },
  detailLogo: { width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 },
  productRow: {
    display: 'flex', gap: 10, alignItems: 'center',
    padding: '8px 12px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
  },
  productThumb: { width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' },
  toast: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '14px 20px',
    boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '0.9rem',
    animation: 'slideUp 0.3s ease', color: 'var(--text-primary)',
  },
};