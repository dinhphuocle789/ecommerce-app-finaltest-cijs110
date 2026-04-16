import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const ITEMS_PER_PAGE = 8;
const EMPTY_FORM = { name: '', price: '', category: '', image: '', description: '', stock: '' };
const CATEGORIES = ['Giày','Áo','Quần','Túi','Điện tử','Đồng hồ','Phụ kiện','Gia dụng','Làm đẹp','Sách'];
const formatPrice = (p) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(p);

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal]           = useState(false);       // open/close
  const [editProduct, setEditProduct] = useState(null);      // null = create
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // product id

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { _page: page, _limit: ITEMS_PER_PAGE };
      if (search) params.name_like = search;
      const res = await api.get('/products', { params });
      setProducts(res.data);
      setTotal(parseInt(res.headers['x-total-count'] || 0, 10));
    } catch { /* handle */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ---------- Helpers ---------- */
  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, price: p.price, category: p.category,
               image: p.image, description: p.description, stock: p.stock });
    setFormError('');
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditProduct(null); };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())        return 'Tên sản phẩm không được trống.';
    if (!form.price || isNaN(form.price) || +form.price <= 0)
                                  return 'Giá phải là số dương.';
    if (!form.category)           return 'Vui lòng chọn danh mục.';
    if (!form.stock || isNaN(form.stock) || +form.stock < 0)
                                  return 'Tồn kho không hợp lệ.';
    return null;
  };

  /* ---------- CRUD ---------- */
  const handleSave = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true); setFormError('');
    const payload = { ...form, price: +form.price, stock: +form.stock };
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      closeModal();
      fetchProducts();
    } catch { setFormError('Lưu thất bại. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setDeleteConfirm(null);
      fetchProducts();
    } catch { alert('Xóa thất bại.'); }
  };

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  /* ---------- Render ---------- */
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 className="page-title">⚙ Quản lý sản phẩm</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:4 }}>
            {total} sản phẩm trong hệ thống
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={s.searchRow}>
        <input className="form-input" placeholder="🔍 Tìm tên sản phẩm..."
          value={searchInput} onChange={e => setSearchInput(e.target.value)}
          style={{ flex:1 }} />
        <button type="submit" className="btn btn-secondary">Tìm</button>
        {search && (
          <button type="button" className="btn btn-ghost"
            onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            ✕ Xóa
          </button>
        )}
      </form>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div style={s.empty}><div style={{fontSize:'2.5rem',marginBottom:12}}>📦</div>
          <p>Không có sản phẩm nào.</p></div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Ảnh','Tên sản phẩm','Danh mục','Giá','Tồn kho','Thao tác'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>
                    <img src={p.image} alt={p.name}
                      style={s.thumb}
                      onError={e => { e.target.style.display='none'; }} />
                  </td>
                  <td style={{ ...s.td, maxWidth:220 }}>
                    <div style={{ fontWeight:600, fontSize:'0.9rem',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.description}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.catBadge}>{p.category}</span>
                  </td>
                  <td style={{ ...s.td, color:'var(--accent)', fontWeight:700,
                    fontFamily:'var(--font-display)', whiteSpace:'nowrap' }}>
                    {formatPrice(p.price)}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      color: p.stock === 0 ? 'var(--danger)' : p.stock < 10 ? 'var(--accent)' : 'var(--success)',
                      fontWeight: 600
                    }}>{p.stock}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        ✏ Sửa
                      </button>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(p.id)}>
                        🗑 Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages}
        onPageChange={p => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}); }} />

      {/* ===== Modal Create/Edit ===== */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">
                {editProduct ? '✏ Sửa sản phẩm' : '+ Thêm sản phẩm'}
              </h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Tên sản phẩm *</label>
                <input name="name" className="form-input"
                  placeholder="VD: Giày Nike Air Max" value={form.name} onChange={handleChange} />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
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
                <label className="form-label">URL Ảnh</label>
                <input name="image" className="form-input"
                  placeholder="https://images.unsplash.com/..." value={form.image} onChange={handleChange} />
                {form.image && (
                  <img src={form.image} alt="preview"
                    style={{ marginTop:8, height:80, borderRadius:'var(--radius-md)',
                      objectFit:'cover', border:'1px solid var(--border)' }}
                    onError={e => e.target.style.display='none'} />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea name="description" className="form-textarea"
                  placeholder="Mô tả ngắn về sản phẩm..."
                  value={form.description} onChange={handleChange} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Đang lưu...' : editProduct ? '💾 Cập nhật' : '+ Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal-box" style={{ maxWidth:400 }}>
            <div style={{ textAlign:'center', padding:'8px 0 24px' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>⚠️</div>
              <h2 style={{ marginBottom:10 }}>Xác nhận xóa</h2>
              <p style={{ color:'var(--text-secondary)' }}>
                Bạn có chắc muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
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

const s = {
  header:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
               marginBottom:28, gap:16, flexWrap:'wrap' },
  searchRow:{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' },
  tableWrap:{ overflowX:'auto', borderRadius:'var(--radius-lg)',
               border:'1px solid var(--border)' },
  table:    { width:'100%', borderCollapse:'collapse' },
  th:       { padding:'12px 16px', textAlign:'left', fontSize:'0.78rem', fontWeight:700,
               color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em',
               background:'var(--bg-elevated)', borderBottom:'1px solid var(--border)',
               whiteSpace:'nowrap' },
  tr:       { borderBottom:'1px solid var(--border)', transition:'var(--transition)' },
  td:       { padding:'12px 16px', verticalAlign:'middle', fontSize:'0.9rem' },
  thumb:    { width:52, height:52, objectFit:'cover', borderRadius:'var(--radius-sm)',
               background:'var(--bg-elevated)', display:'block' },
  catBadge: { padding:'3px 10px', borderRadius:999, fontSize:'0.75rem', fontWeight:600,
               background:'var(--bg-elevated)', color:'var(--text-secondary)',
               border:'1px solid var(--border)' },
  actions:  { display:'flex', gap:6 },
  empty:    { textAlign:'center', padding:'60px 20px', color:'var(--text-secondary)' },
};