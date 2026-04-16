import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Vui lòng nhập họ tên.';
    if (!form.email) return 'Vui lòng nhập email.';
    if (!form.email.endsWith('@gmail.com')) return 'Chỉ chấp nhận tài khoản @gmail.com.';
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data || '';
      if (msg.includes('Email already exists')) {
        setError('Email này đã được sử dụng.');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>◈</div>
          <h1 style={styles.title}>Tạo tài khoản</h1>
          <p style={styles.subtitle}>Tham gia ShopVN hôm nay</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              name="name"
              type="text"
              className="form-input"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="yourname@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              name="confirm"
              type="password"
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          {/* Password strength */}
          {form.password && (
            <div style={styles.strength}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 6 }}>
                Độ mạnh mật khẩu:
              </div>
              <div style={styles.strengthBar}>
                {[1,2,3,4].map((i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.strengthSegment,
                      background: i <= Math.min(4, Math.ceil(form.password.length / 3))
                        ? form.password.length < 6 ? 'var(--danger)' : form.password.length < 10 ? 'var(--accent)' : 'var(--success)'
                        : 'var(--border)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '⏳ Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <div style={styles.footer}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Đăng nhập
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
    maxWidth: 440,
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  strength: {
    marginTop: -4,
  },
  strengthBar: {
    display: 'flex',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    transition: 'background 0.3s ease',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
};