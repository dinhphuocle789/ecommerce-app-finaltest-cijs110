import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // user object
  const [toast, setToast]               = useState('');

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { _page: page, _limit: ITEMS_PER_PAGE };
      if (search) params.email_like = search;
      const res = await api.get('/users', { params });
      setUsers(res.data);
      setTotal(parseInt(res.headers['x-total-count'] || 0, 10));
    } catch {
      showToast('❌ Không thể tải danh sách users.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user) => {
    try {
      await api.delete(`/users/${user.id}`);
      setDeleteConfirm(null);
      showToast(`✅ Đã xóa tài khoản "${user.email}"`);
      // If last item on page, go back
      if (users.length === 1 && page > 1) setPage(p => p - 1);
      else fetchUsers();
    } catch {
      showToast('❌ Xóa thất bại. Vui lòng thử lại.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

      {/* Toast */}
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 className="page-title">👥 Quản lý người dùng</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {total} tài khoản trong hệ thống
          </p>
        </div>

        {/* Stats cards */}
        <div style={s.statCards}>
          <StatCard label="Tổng users" value={total} icon="👤" />
          <StatCard
            label="Admin"
            value={users.filter(u => u.role === 'admin').length}
            icon="⚙"
            accent
          />
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          className="form-input"
          placeholder="🔍 Tìm theo email..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-secondary">Tìm</button>
        {search && (
          <button type="button" className="btn btn-ghost" onClick={clearSearch}>
            ✕ Xóa
          </button>
        )}
      </form>

      {search && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
          Kết quả tìm kiếm cho "<strong style={{ color: 'var(--accent)' }}>{search}</strong>"
        </p>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
          <p>Không tìm thấy người dùng nào.</p>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['#', 'Tên', 'Email', 'Vai trò', 'ID', 'Thao tác'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const isSelf    = u.id === currentUser?.id;
                const isAdmin   = u.role === 'admin';
                const rowNum    = (page - 1) * ITEMS_PER_PAGE + idx + 1;

                return (
                  <tr
                    key={u.id}
                    style={{
                      ...s.tr,
                      ...(isSelf ? s.trSelf : {}),
                    }}
                  >
                    {/* # */}
                    <td style={{ ...s.td, color: 'var(--text-muted)', width: 40 }}>
                      {rowNum}
                    </td>

                    {/* Avatar + Name */}
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={{
                          ...s.avatar,
                          background: isAdmin ? 'var(--accent)' : 'var(--bg-elevated)',
                          color: isAdmin ? '#0a0a12' : 'var(--text-primary)',
                          border: isAdmin ? 'none' : '1px solid var(--border)',
                        }}>
                          {(u.name || u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {u.name || '—'}
                          </div>
                          {isSelf && (
                            <span style={s.selfBadge}>Bạn</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ ...s.td, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {u.email}
                    </td>

                    {/* Role badge */}
                    <td style={s.td}>
                      <span style={isAdmin ? s.roleBadgeAdmin : s.roleBadgeUser}>
                        {isAdmin ? '⚙ Admin' : '👤 User'}
                      </span>
                    </td>

                    {/* ID */}
                    <td style={{ ...s.td, color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      #{u.id}
                    </td>

                    {/* Actions */}
                    <td style={s.td}>
                      {isSelf ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Tài khoản của bạn
                        </span>
                      ) : (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirm(u)}
                          title={`Xóa ${u.email}`}
                        >
                          🗑 Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />

      {/* ===== Delete Confirm Modal ===== */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}
        >
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={s.warnIcon}>⚠️</div>
              <h2 style={{ marginBottom: 10, fontFamily: 'var(--font-display)' }}>
                Xác nhận xóa tài khoản
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Bạn sắp xóa tài khoản:
              </p>

              {/* User info box */}
              <div style={s.confirmBox}>
                <div style={s.confirmAvatar}>
                  {(deleteConfirm.name || deleteConfirm.email)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {deleteConfirm.name || 'Không có tên'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {deleteConfirm.email}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 12 }}>
                ⚠ Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                🗑 Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Mini stat card ---- */
function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      ...s.statCard,
      ...(accent ? s.statCardAccent : {}),
    }}>
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)',
          color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ---- Styles ---- */
const s = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap',
  },
  statCards: {
    display: 'flex', gap: 12, flexShrink: 0,
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 18px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    minWidth: 120,
  },
  statCardAccent: {
    background: 'var(--accent-muted)',
    border: '1px solid rgba(245,158,11,0.3)',
  },
  searchRow: {
    display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem',
    fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', background: 'var(--bg-elevated)',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.15s' },
  trSelf: { background: 'rgba(245,158,11,0.04)' },
  td: { padding: '12px 16px', verticalAlign: 'middle', fontSize: '0.9rem' },

  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
  },
  selfBadge: {
    display: 'inline-block', marginTop: 2,
    padding: '1px 7px', borderRadius: 999,
    background: 'var(--accent-muted)', color: 'var(--accent)',
    fontSize: '0.7rem', fontWeight: 700,
  },
  roleBadgeAdmin: {
    padding: '4px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
    background: 'var(--accent-muted)', color: 'var(--accent)',
    border: '1px solid rgba(245,158,11,0.3)',
  },
  roleBadgeUser: {
    padding: '4px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600,
    background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
  empty: { textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' },

  warnIcon: { fontSize: '3rem', marginBottom: 14 },
  confirmBox: {
    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '12px 16px', margin: '16px 0 0',
  },
  confirmAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--danger-muted)', color: 'var(--danger)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '1rem', flexShrink: 0,
    border: '1px solid rgba(239,68,68,0.3)',
  },
  toast: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '14px 20px',
    boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '0.9rem',
    animation: 'slideUp 0.3s ease',
    color: 'var(--text-primary)',
  },
};