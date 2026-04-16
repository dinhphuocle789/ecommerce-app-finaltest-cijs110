import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 8;
const CATEGORIES = ['Giày','Áo','Quần','Túi','Điện tử','Đồng hồ','Phụ kiện','Gia dụng','Làm đẹp','Sách'];
const EMPTY_FORM = { name: '', price: '', category: '', image: '', description: '', stock: '' };
const fmt = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ShopDashboard() {
  const { user } = useAuth();

  const [shop, setShop]             = useState(null);
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [shopLoading, setShopLoading] = useState(true);

  const [modal, setModal]           = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast]           = useState('');

  // Shop profile edit
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm]   = useState({});
  const [profileSaving, setProfileSaving] = useState(false);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ---- Fetch shop of current user ---- */
  useEffect(() => {
    const fetchShop = async () => {
      setShopLoading(true);
      try {
        const res = await api.get(`/shops?ownerId=${user.id}`);
        if (res.data.length > 0) {
          setShop(res.data[0]);
          setProfileForm(res.data[0]);
        }
      } catch { /* no shop yet */ }
      finally { setShopLoading(false); }
    };
    if (user?.id) fetchShop();
  }, [user]);

  /* ---- Fetch products of this shop ---- */
  const fetchProducts = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { shopId: shop.id, _page: page, _limit: ITEMS_PER_PAGE },
      });
      setProducts(res.data);
      setTotal(parseInt(res.headers['x-total-count'] || 0, 10));
    } catch { showToast('❌ Không thể tải sản phẩm.'); }
    finally { setLoading(false); }
  }, [shop, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ---- Product CRUD ---- */
  const openCreate = () => {
    setEditProduct(null); setForm(EMPTY_FORM); setFormError(''); setModal(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, category: p.category,
               image: p.image, description: p.description, stock: p.stock });
    setFormError(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditProduct(null); };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Tên sản phẩm không được trống.';
    if (!form.price || isNaN(form.price) || +form.price <= 0) return 'Giá phải là số dương.';
    if (!form.category) return 'Vui lòng chọn danh mục.';
    if (!form.stock || isNaN(form.stock) || +form.stock < 0) return 'Tồn kho không hợp lệ.';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    const payload = { ...form, price: +form.price, stock: +form.stock, shopId: shop.id };
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
        showToast('✅ Đã cập nhật sản phẩm!');
      } else {
        await api.post('/products', payload);
        showToast('✅ Đã thêm sản phẩm mới!');
      }
      closeModal(); fetchProducts();
    } catch { setFormError('Lưu thất bại. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteConfirm(null);
      showToast('✅ Đã xóa sản phẩm!');
      if (products.length === 1 && page > 1) setPage(p => p - 1);
      else fetchProducts();
    } catch { showToast('❌ Xóa thất bại.'); }
  };

  /* ---- Shop profile update ---- */
  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put(`/shops/${shop.id}`, profileForm);
      setShop(res.data);
      setProfileModal(false);
      showToast('✅ Đã cập nhật thông tin cửa hàng!');
    } catch { showToast('❌ Cập nhật thất bại.'); }
    finally { setProfileSaving(false); }
  };

  /* ---- Loading state ---- */
  if (shopLoading) return (
    <div className="loading-center"><div className="spinner" /></div>
  );

  if (!shop) return (
    <div style={s.noShop}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏪</div>
      <h2 style={{ marginBottom: 8 }}>Bạn chưa có cửa hàng</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Có vẻ tài khoản Shop của bạn chưa được liên kết với cửa hàng nào.
      </p>
    </div>
  );

  const statusMeta = {
    active:  { label: '● Đang hoạt động', color: 'var(--success)', bg: 'var(--success-muted)' },
    pending: { label: '● Chờ duyệt',       color: 'var(--accent)',  bg: 'var(--accent-muted)'  },
    banned:  { label: '● Bị khóa',          color: 'var(--danger)',  bg: 'var(--danger-muted)'  },
  };
  const status = statusMeta[shop.status] || statusMeta.active;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

      {/* Toast */}
      {toast && <div style={s.toast}>{toast}</div>}

      {/* Shop profile card */}
      <div style={s.shopCard}>
        <div style={s.shopLeft}>
          {shop.logo ? (
            <img src={shop.logo} alt={shop.name} style={s.shopLogo}
              onError={e => e.target.style.display = 'none'} />
          ) : (
            <div style={s.shopLogoFallback}>{shop.name[0]}</div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>
                {shop.name}
              </h2>
              <span style={{ ...s.statusBadge, color: status.color, background: status.bg }}>
                {status.label}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 8px' }}>
              {shop.description || 'Chưa có mô tả'}
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={s.meta}>📦 {total} sản phẩm</span>
              <span style={s.meta}>🏷 {shop.category}</span>
              <span style={s.meta}>📅 {shop.createdAt}</span>
            </div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setProfileModal(true)}>
          ✏ Sửa thông tin
        </button>
      </div>

      {/* Products header */}
      <div style={s.header}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem' }}>
            Sản phẩm của tôi
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Quản lý toàn bộ sản phẩm trong cửa hàng
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        {[
          { label: 'Tổng sản phẩm', value: total, icon: '📦' },
          { label: 'Còn hàng', value: products.filter(p => p.stock > 0).length, icon: '✅' },
          { label: 'Hết hàng', value: products.filter(p => p.stock === 0).length, icon: '⚠️' },
          { label: 'Tồn kho', value: products.reduce((s, p) => s + p.stock, 0), icon: '🗃' },
        ].map(stat => (
          <div key={stat.label} style={s.statCard}>
            <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📦</div>
          <h3>Chưa có sản phẩm nào</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, marginBottom: 20 }}>
            Hãy thêm sản phẩm đầu tiên cho cửa hàng của bạn!
          </p>
          <button className="btn btn-primary" onClick={openCreate}>+ Thêm sản phẩm</button>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Ảnh', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Thao tác'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>
                    <img src={p.image} alt={p.name} style={s.thumb}
                      onError={e => e.target.style.display = 'none'} />
                  </td>
                  <td style={{ ...s.td, maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.catBadge}>{p.category}</span>
                  </td>
                  <td style={{ ...s.td, color: 'var(--accent)', fontWeight: 700,
                    fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                    {fmt(p.price)}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      fontWeight: 700,
                      color: p.stock === 0 ? 'var(--danger)' : p.stock < 10 ? 'var(--accent)' : 'var(--success)',
                    }}>{p.stock}</span>
                    {p.stock === 0 && <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Hết hàng</div>}
                    {p.stock > 0 && p.stock < 10 && <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>Sắp hết</div>}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p.id)}>🗑 Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages}
        onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      {/* ===== Product Modal ===== */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">{editProduct ? '✏ Sửa sản phẩm' : '+ Thêm sản phẩm'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input name="name" className="form-input" placeholder="VD: Áo thun nam basic"
                  value={form.name} onChange={handleChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Giá (VND) *</label>
                  <input name="price" type="number" className="form-input"
                    placeholder="500000" value={form.price} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tồn kho *</label>
                  <input name="stock" type="number" className="form-input"
                    placeholder="50" value={form.stock} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select name="category" className="form-select"
                  value={form.category} onChange={handleChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">URL Ảnh sản phẩm</label>
                <input name="image" className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image} onChange={handleChange} />
                {form.image && (
                  <img src={form.image} alt="preview"
                    style={{ marginTop: 8, height: 80, borderRadius: 'var(--radius-md)',
                      objectFit: 'cover', border: '1px solid var(--border)' }}
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả sản phẩm</label>
                <textarea name="description" className="form-textarea"
                  placeholder="Mô tả ngắn về sản phẩm..."
                  value={form.description} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Đang lưu...' : editProduct ? '💾 Cập nhật' : '+ Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm ===== */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
              <h2 style={{ marginBottom: 8 }}>Xác nhận xóa sản phẩm?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>🗑 Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Shop Profile Modal ===== */}
      {profileModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setProfileModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">✏ Chỉnh sửa cửa hàng</h2>
              <button className="modal-close" onClick={() => setProfileModal(false)}>✕</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Tên cửa hàng</label>
                <input className="form-input" value={profileForm.name || ''}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-textarea" value={profileForm.description || ''}
                  onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">URL Logo</label>
                <input className="form-input" value={profileForm.logo || ''}
                  onChange={e => setProfileForm(p => ({ ...p, logo: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProfileModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleProfileSave} disabled={profileSaving}>
                {profileSaving ? '⏳...' : '💾 Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  noShop: { textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' },
  toast: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '14px 20px',
    boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '0.9rem',
    animation: 'slideUp 0.3s ease', color: 'var(--text-primary)',
  },
  shopCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '24px 28px',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 20, marginBottom: 32, flexWrap: 'wrap',
  },
  shopLeft: { display: 'flex', alignItems: 'flex-start', gap: 20, flex: 1 },
  shopLogo: {
    width: 72, height: 72, borderRadius: 'var(--radius-lg)',
    objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0,
  },
  shopLogoFallback: {
    width: 72, height: 72, borderRadius: 'var(--radius-lg)',
    background: 'var(--accent)', color: '#0a0a12',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', fontWeight: 800, flexShrink: 0,
  },
  statusBadge: {
    padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
  },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, gap: 16, flexWrap: 'wrap',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12, marginBottom: 24,
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '14px 16px',
  },
  tableWrap: { overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
    background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' },
  thumb: { width: 52, height: 52, objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' },
  catBadge: {
    padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
    background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
  },
  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' },
};