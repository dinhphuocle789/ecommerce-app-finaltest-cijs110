import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const SHOP_CATEGORIES = [
  'Thời trang & Thể thao',
  'Điện tử & Công nghệ',
  'Gia dụng & Nội thất',
  'Làm đẹp & Sức khỏe',
  'Sách & Văn phòng phẩm',
  'Thực phẩm & Đồ uống',
  'Đồ chơi & Trẻ em',
  'Khác',
];

export default function ShopRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: account, 2: shop info
  const [account, setAccount] = useState({ name: '', email: '', password: '', confirm: '' });
  const [shopInfo, setShopInfo] = useState({ shopName: '', description: '', category: '', logo: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccountChange = (e) =>
    setAccount(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleShopChange = (e) =>
    setShopInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    if (!account.name.trim())        return 'Vui lòng nhập họ tên.';
    if (!account.email)              return 'Vui lòng nhập email.';
    if (!account.email.endsWith('@gmail.com')) return 'Chỉ chấp nhận tài khoản @gmail.com.';
    if (account.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
    if (account.password !== account.confirm) return 'Mật khẩu xác nhận không khớp.';
    return null;
  };

  const validateStep2 = () => {
    if (!shopInfo.shopName.trim())   return 'Vui lòng nhập tên cửa hàng.';
    if (!shopInfo.category)          return 'Vui lòng chọn danh mục kinh doanh.';
    return null;
  };

  const handleNextStep = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Register user with role=shop
      const userData = await register(account.name, account.email, account.password, 'shop');

      // 2. Create shop profile
      await api.post('/shops', {
        ownerId: userData.id,
        name: shopInfo.shopName,
        description: shopInfo.description,
        logo: shopInfo.logo || '',
        category: shopInfo.category,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      });

      navigate('/shop/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data || '';
      if (typeof msg === 'string' && msg.includes('Email already exists')) {
        setError('Email này đã được sử dụng.');
        setStep(1);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrapper}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.icon}>🏪</div>
          <h1 style={s.title}>Đăng ký Cửa hàng</h1>
          <p style={s.subtitle}>Trở thành nhà cung cấp trên ShopVN</p>
        </div>

        {/* Step indicator */}
        <div style={s.steps}>
          {[{ n: 1, label: 'Tài khoản' }, { n: 2, label: 'Cửa hàng' }].map(({ n, label }) => (
            <div key={n} style={s.stepItem}>
              <div style={{
                ...s.stepCircle,
                ...(step >= n ? s.stepCircleActive : {}),
              }}>
                {step > n ? '✓' : n}
              </div>
              <span style={{
                ...s.stepLabel,
                color: step >= n ? 'var(--accent)' : 'var(--text-muted)',
              }}>{label}</span>
              {n < 2 && <div style={{ ...s.stepLine, background: step > n ? 'var(--accent)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Step 1 — Account */}
        {step === 1 && (
          <div style={s.form}>
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input name="name" type="text" className="form-input"
                placeholder="Nguyễn Văn A"
                value={account.name} onChange={handleAccountChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-input"
                placeholder="yourname@gmail.com"
                value={account.email} onChange={handleAccountChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input name="password" type="password" className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={account.password} onChange={handleAccountChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu *</label>
              <input name="confirm" type="password" className="form-input"
                placeholder="Nhập lại mật khẩu"
                value={account.confirm} onChange={handleAccountChange} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}
              onClick={handleNextStep}>
              Tiếp theo →
            </button>
          </div>
        )}

        {/* Step 2 — Shop info */}
        {step === 2 && (
          <div style={s.form}>
            <div className="form-group">
              <label className="form-label">Tên cửa hàng *</label>
              <input name="shopName" type="text" className="form-input"
                placeholder="VD: Nike VN Store"
                value={shopInfo.shopName} onChange={handleShopChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Danh mục kinh doanh *</label>
              <select name="category" className="form-select"
                value={shopInfo.category} onChange={handleShopChange}>
                <option value="">-- Chọn danh mục --</option>
                {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả cửa hàng</label>
              <textarea name="description" className="form-textarea"
                placeholder="Giới thiệu ngắn về cửa hàng của bạn..."
                value={shopInfo.description} onChange={handleShopChange} />
            </div>
            <div className="form-group">
              <label className="form-label">URL Logo cửa hàng</label>
              <input name="logo" type="text" className="form-input"
                placeholder="https://..."
                value={shopInfo.logo} onChange={handleShopChange} />
              {shopInfo.logo && (
                <img src={shopInfo.logo} alt="logo preview"
                  style={{ marginTop: 8, height: 64, width: 64, borderRadius: '50%',
                    objectFit: 'cover', border: '2px solid var(--border)' }}
                  onError={e => e.target.style.display = 'none'} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => { setStep(1); setError(''); }}>
                ← Quay lại
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={handleSubmit} disabled={loading}>
                {loading ? '⏳ Đang tạo...' : '🏪 Tạo cửa hàng'}
              </button>
            </div>
          </div>
        )}

        <div style={s.footer}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Đăng nhập</Link>
          {' · '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Đăng ký thường
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '40px', width: '100%',
    maxWidth: 460, boxShadow: 'var(--shadow-md)', animation: 'slideUp 0.3s ease',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  icon: { fontSize: '2.5rem', marginBottom: 12, display: 'block' },
  title: { fontSize: '1.8rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 6 },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
  steps: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 0, marginBottom: 28,
  },
  stepItem: { display: 'flex', alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--bg-elevated)', border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)',
    transition: 'all 0.3s ease',
  },
  stepCircleActive: {
    background: 'var(--accent)', borderColor: 'var(--accent)', color: '#0a0a12',
  },
  stepLabel: { fontSize: '0.8rem', fontWeight: 600 },
  stepLine: { width: 40, height: 2, borderRadius: 1, margin: '0 8px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' },
};