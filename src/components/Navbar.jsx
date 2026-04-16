import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function AdminMenu({ isActive }) {
  const [open, setOpen] = useState(false);
  const isAdminActive =
    isActive('/admin/products') || isActive('/admin/users') || isActive('/admin/shops');

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...styles.link,
          ...(isAdminActive ? styles.linkActive : {}),
          cursor: 'pointer', border: 'none',
          background: isAdminActive ? 'var(--bg-elevated)' : 'transparent',
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-body)',
        }}
      >
        ⚙ Quản trị
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} onClick={() => setOpen(false)} />
          <div style={styles.adminDropdown}>
            {[
              { to: '/admin/products', icon: '📦', label: 'Sản phẩm',    sub: 'Thêm, sửa, xóa sản phẩm' },
              { to: '/admin/shops',    icon: '🏪', label: 'Cửa hàng',    sub: 'Duyệt & quản lý shops'   },
              { to: '/admin/users',    icon: '👥', label: 'Người dùng',  sub: 'Xem & xóa tài khoản'     },
            ].map(item => (
              <Link key={item.to} to={item.to}
                style={{ ...styles.adminDropItem, ...(isActive(item.to) ? styles.adminDropItemActive : {}) }}
                onClick={() => setOpen(false)}>
                <span>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, isAdmin, isShop } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>ShopVN</span>
        </Link>

        {/* Nav links */}
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.linkActive : {}) }}>
            Cửa hàng
          </Link>

          {isShop && !isAdmin && (
            <Link to="/shop/dashboard"
              style={{ ...styles.link, ...(isActive('/shop/dashboard') ? styles.linkActive : {}) }}>
              🏪 Dashboard
            </Link>
          )}

          {isAdmin && <AdminMenu isActive={isActive} />}
        </div>

        {/* Right */}
        <div style={styles.actions}>
          {user ? (
            <>
              {/* Cart — hide for admin/shop */}
              {!isAdmin && !isShop && (
                <Link to="/cart" style={styles.cartBtn}>
                  <span>🛒</span>
                  <span>Giỏ hàng</span>
                  {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
                </Link>
              )}

              {/* User menu */}
              <div style={styles.userMenu}>
                <button style={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                  <span style={styles.avatar}>
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                  <span style={styles.userName}>
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {menuOpen ? '▲' : '▼'}
                  </span>
                </button>

                {menuOpen && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownInfo}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {user.name || 'Người dùng'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {user.email}
                      </div>
                      <span style={{
                        display: 'inline-block', marginTop: 4,
                        padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                        background: isAdmin ? 'var(--accent-muted)' : isShop ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)',
                        color: isAdmin ? 'var(--accent)' : isShop ? 'var(--success)' : 'var(--text-muted)',
                      }}>
                        {isAdmin ? '⚙ ADMIN' : isShop ? '🏪 SHOP' : '👤 USER'}
                      </span>
                    </div>
                    <div style={styles.dropdownDivider} />
                    {isShop && !isAdmin && (
                      <Link to="/shop/dashboard" style={styles.dropdownLink}
                        onClick={() => setMenuOpen(false)}>
                        🏪 Quản lý cửa hàng
                      </Link>
                    )}
                    <button style={styles.dropdownItem} onClick={handleLogout}>
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-secondary btn-sm">Đăng ký</Link>
              <Link to="/shop/register" className="btn btn-primary btn-sm">🏪 Mở shop</Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(10, 10, 18, 0.88)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)', height: 72,
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 20px',
    height: '100%', display: 'flex', alignItems: 'center', gap: 24,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 },
  logoIcon: { fontSize: '1.5rem', color: 'var(--accent)', lineHeight: 1 },
  logoText: {
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem',
    color: 'var(--text-primary)', letterSpacing: '-0.02em',
  },
  links: { display: 'flex', alignItems: 'center', gap: 4, flex: 1 },
  link: {
    padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
    fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none',
    transition: 'var(--transition)',
  },
  linkActive: { color: 'var(--text-primary)', background: 'var(--bg-elevated)' },
  actions: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  cartBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', textDecoration: 'none',
    fontSize: '0.9rem', fontWeight: 500, transition: 'var(--transition)', position: 'relative',
  },
  cartBadge: {
    background: 'var(--accent)', color: '#0a0a12', borderRadius: '999px',
    width: 20, height: 20, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800,
  },
  userMenu: { position: 'relative' },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', cursor: 'pointer',
    transition: 'var(--transition)', color: 'var(--text-primary)',
  },
  avatar: {
    width: 28, height: 28, background: 'var(--accent)', color: '#0a0a12',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
  },
  userName: {
    fontSize: '0.88rem', fontWeight: 600, maxWidth: 100,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', minWidth: 210, boxShadow: 'var(--shadow-md)',
    animation: 'slideDown 0.15s ease', overflow: 'hidden', zIndex: 10,
  },
  dropdownInfo: { padding: '14px 16px' },
  dropdownDivider: { height: 1, background: 'var(--border)' },
  dropdownLink: {
    display: 'block', padding: '11px 16px', textDecoration: 'none',
    fontSize: '0.9rem', color: 'var(--text-secondary)', transition: 'var(--transition)',
  },
  dropdownItem: {
    display: 'block', width: '100%', padding: '12px 16px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)',
    transition: 'var(--transition)', fontFamily: 'var(--font-body)',
  },
  authBtns: { display: 'flex', gap: 8 },
  overlay: { position: 'fixed', inset: 0, zIndex: -1 },
  adminDropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', minWidth: 230, boxShadow: 'var(--shadow-md)',
    animation: 'slideDown 0.15s ease', overflow: 'hidden', zIndex: 10, padding: '6px',
  },
  adminDropItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    borderRadius: 'var(--radius-md)', textDecoration: 'none',
    color: 'var(--text-primary)', transition: 'var(--transition)', fontSize: '1.2rem',
  },
  adminDropItemActive: {
    background: 'var(--accent-muted)', color: 'var(--accent)',
  },
};