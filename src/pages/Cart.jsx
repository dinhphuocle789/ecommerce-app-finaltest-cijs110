import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const [ordered, setOrdered] = useState(false);

  const handleCheckout = () => {
    clearCart();
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div style={styles.successWrapper}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Đặt hàng thành công!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Cảm ơn bạn đã mua hàng tại ShopVN. Đơn hàng của bạn đang được xử lý.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={styles.emptyWrapper}>
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>🛒</div>
          <h2 style={{ marginBottom: 8 }}>Giỏ hàng trống</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div style={styles.header}>
        <div>
          <h1 className="page-title">Giỏ hàng</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {totalItems} sản phẩm
          </p>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={clearCart}
        >
          🗑 Xóa tất cả
        </button>
      </div>

      <div style={styles.layout}>
        {/* Cart items */}
        <div style={styles.itemsList}>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQty={(q) => updateQuantity(item.id, q)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>

        {/* Order summary */}
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Tổng đơn hàng</h3>
            <div className="divider" />

            <div style={styles.summaryRows}>
              {cart.map((item) => (
                <div key={item.id} style={styles.summaryRow}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div style={styles.totalRow}>
              <span>Tạm tính:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Phí vận chuyển:
              </span>
              <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                Miễn phí
              </span>
            </div>
            <div className="divider" />
            <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
              <span>Tổng cộng:</span>
              <span style={{ color: 'var(--accent)' }}>{formatPrice(totalPrice)}</span>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 20 }}
              onClick={handleCheckout}
            >
              🛍 Đặt hàng ngay
            </button>

            <Link
              to="/"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: 12,
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItem({ item, onUpdateQty, onRemove }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={styles.item}>
      <div style={styles.itemImage}>
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            style={styles.itemImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.itemImgFallback}>🖼️</div>
        )}
      </div>

      <div style={styles.itemInfo}>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.itemCategory}>{item.category}</div>
        <div style={styles.itemPrice}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / cái</span>
        </div>
      </div>

      <div style={styles.itemControls}>
        <div className="qty-control">
          <button className="qty-btn" onClick={() => onUpdateQty(item.quantity - 1)}>−</button>
          <span className="qty-value">{item.quantity}</span>
          <button className="qty-btn" onClick={() => onUpdateQty(item.quantity + 1)}>+</button>
        </div>

        <div style={styles.itemSubtotal}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
        </div>

        <button
          style={styles.removeBtn}
          onClick={onRemove}
          title="Xóa sản phẩm"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 16,
    flexWrap: 'wrap',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 24,
    alignItems: 'start',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    transition: 'var(--transition)',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    background: 'var(--bg-elevated)',
    flexShrink: 0,
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemImgFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: '1.5rem',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.95rem',
    marginBottom: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemCategory: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: 6,
    background: 'var(--bg-elevated)',
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
  },
  itemPrice: {
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  itemControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  itemSubtotal: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1rem',
    color: 'var(--accent)',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition)',
    opacity: 0.6,
  },
  summary: {},
  summaryCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    position: 'sticky',
    top: 90,
  },
  summaryTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    marginBottom: 16,
  },
  summaryRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontWeight: 600,
  },
  grandTotal: {
    fontSize: '1.1rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
  },
  emptyWrapper: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    maxWidth: 400,
    width: '100%',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: 16,
    display: 'block',
  },
  successWrapper: {
    minHeight: 'calc(100vh - 72px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'var(--bg-surface)',
    border: '1px solid rgba(16,185,129,0.4)',
    borderRadius: 'var(--radius-xl)',
    maxWidth: 400,
    width: '100%',
    animation: 'slideUp 0.4s ease',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'var(--success-muted)',
    border: '2px solid var(--success)',
    color: 'var(--success)',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontWeight: 800,
  },
  successTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.6rem',
    marginBottom: 10,
  },
};