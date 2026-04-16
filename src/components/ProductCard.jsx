import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const inCart = isInCart(product.id);

  return (
    <div style={styles.card}>
      {/* Image */}
      <div style={styles.imageWrapper}>
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            style={styles.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.imageFallback}>🖼️</div>
        )}
        {product.stock === 0 && (
          <div style={styles.outOfStock}>Hết hàng</div>
        )}
        <div style={styles.categoryBadge}>{product.category}</div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.desc}>{product.description}</p>

        <div style={styles.footer}>
          <div style={styles.price}>{formatPrice(product.price)}</div>
          <div style={styles.stock}>
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success)', fontSize: '0.78rem' }}>
                ✓ Còn {product.stock}
              </span>
            ) : (
              <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>
                Hết hàng
              </span>
            )}
          </div>
        </div>

        <button
          style={{
            ...styles.addBtn,
            ...(added ? styles.addBtnSuccess : {}),
            ...(product.stock === 0 ? styles.addBtnDisabled : {}),
          }}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {added ? '✓ Đã thêm!' : inCart ? '🛒 Thêm nữa' : '+ Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: '4/3',
    overflow: 'hidden',
    background: 'var(--bg-elevated)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    display: 'block',
  },
  imageFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: '3rem',
    color: 'var(--text-muted)',
  },
  outOfStock: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontWeight: 700,
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'rgba(10,10,18,0.8)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  name: {
    fontSize: '0.95rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  desc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.05rem',
    color: 'var(--accent)',
  },
  addBtn: {
    width: '100%',
    padding: '10px',
    background: 'var(--accent-muted)',
    color: 'var(--accent)',
    border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: '0.88rem',
    transition: 'all 0.2s ease',
    marginTop: 4,
  },
  addBtnSuccess: {
    background: 'var(--success-muted)',
    color: 'var(--success)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  addBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};