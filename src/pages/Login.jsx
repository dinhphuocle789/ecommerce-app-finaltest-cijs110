import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!email.endsWith('@gmail.com')) {
      setError('Chỉ chấp nhận tài khoản @gmail.com.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = await login(email, password);
      if (userData?.role === 'admin') {
        navigate('/admin/products', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data || '';
      if (msg.includes('Cannot find user')) {
        setError('Email không tồn tại.');
      } else if (msg.includes('Incorrect password')) {
        setError('Mật khẩu không đúng.');
      } else {
        setError('Đăng nhập thất bại. Chỉ dùng @gmail.com.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.icon}>◈</div>
          <h1 style={styles.title}>Đăng nhập</h1>
          <p style={styles.subtitle}>Chào mừng trở lại ShopVN</p>
        </div>

        {/* Demo hint */}
        <div style={styles.hint}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--accent)' }}>
            💡 Tài khoản mẫu
          </div>
          <div>Admin: <code>admin@gmail.com</code> / <code>Admin123!</code></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={styles.footer}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: 'var(--shadow-md)',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: '2rem',
    color: 'var(--accent)',
    marginBottom: 12,
    display: 'block',
  },
  title: {
    fontSize: '1.8rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    marginBottom: 6,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  hint: {
    background: 'var(--accent-muted)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    marginBottom: 20,
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};