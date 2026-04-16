export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Limit visible pages
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        range.push(i);
      }
    }

    let prev;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) rangeWithDots.push(prev + 1);
        else if (i - prev > 2) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }
    return rangeWithDots;
  };

  return (
    <div style={styles.wrapper}>
      <button
        style={{
          ...styles.btn,
          ...(currentPage === 1 ? styles.btnDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Trước
      </button>

      {getVisiblePages().map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} style={styles.dots}>
            ···
          </span>
        ) : (
          <button
            key={page}
            style={{
              ...styles.btn,
              ...(page === currentPage ? styles.btnActive : {}),
            }}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        style={{
          ...styles.btn,
          ...(currentPage === totalPages ? styles.btnDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau →
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '32px 0',
    flexWrap: 'wrap',
  },
  btn: {
    minWidth: 38,
    height: 38,
    padding: '0 12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'var(--transition)',
    fontFamily: 'var(--font-body)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    background: 'var(--accent)',
    color: '#0a0a12',
    borderColor: 'var(--accent)',
    fontWeight: 700,
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  dots: {
    color: 'var(--text-muted)',
    padding: '0 4px',
    fontSize: '0.9rem',
  },
};