import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STATUSES } from '../../shared/menu.js';
import { listOrders, updateOrderStatus, deleteOrder } from '../api.js';

const POLL_MS = 4000;
const PW_KEY = 'forti-barista-password';

export default function QueuePage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback((pw) => {
    listOrders(pw)
      .then((rows) => {
        setOrders(rows);
        setLoaded(true);
        setAuthed(true);
        setAuthError(null);
        sessionStorage.setItem(PW_KEY, pw);
      })
      .catch((e) => {
        setAuthed(false);
        setAuthError(e.message || 'wrong password');
        sessionStorage.removeItem(PW_KEY);
      });
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) {
      setPassword(saved);
      refresh(saved);
    }
  }, [refresh]);

  useEffect(() => {
    if (!authed) return;
    const timer = setInterval(() => refresh(password), POLL_MS);
    return () => clearInterval(timer);
  }, [authed, password, refresh]);

  const submitPassword = (e) => {
    e.preventDefault();
    refresh(password);
  };

  const advance = (order) => {
    const next = STATUSES[order.status].next;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    updateOrderStatus(order.id, next, password)
      .then(() => refresh(password))
      .catch(() => refresh(password));
  };

  const remove = (order) => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    deleteOrder(order.id, password)
      .then(() => refresh(password))
      .catch(() => refresh(password));
  };

  if (!authed) {
    return (
      <div className="queue-page">
        <div className="queue-head">
          <div className="queue-title">คิววันนี้ · Queue</div>
          <Link to="/" className="link-btn">
            ← ร้าน · Shop
          </Link>
        </div>
        <form onSubmit={submitPassword} className="fields">
          <div>
            <label className="field-label">รหัสบาริสต้า · Barista password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {authError && (
            <div className="empty-note" style={{ color: '#b00020', opacity: 1 }}>
              {authError}
            </div>
          )}
          <button type="submit" className="add-btn">
            เข้าสู่ระบบ · Enter
          </button>
        </form>
      </div>
    );
  }

  const countWaiting = orders.filter((o) => o.status !== 'done').length;
  const countDone = orders.filter((o) => o.status === 'done').length;

  return (
    <div className="queue-page">
      <div className="queue-head">
        <div className="queue-title">คิววันนี้ · Queue</div>
        <Link to="/" className="link-btn">
          ← ร้าน · Shop
        </Link>
      </div>

      <div className="queue-badges">
        <span className="queue-badge badge-wait">{countWaiting} รอชง · to make</span>
        <span className="queue-badge badge-done-count">{countDone} เสร็จ · done</span>
      </div>

      <div className="orders-list">
        {orders.map((o) => {
          const st = STATUSES[o.status];
          const itemsLabel = o.items.map((i) => `${i.qty}× ${i.short}`).join(', ');
          const time = new Date(o.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <div
              className="order-card"
              key={o.id}
              style={{ background: st.bg, borderLeftColor: st.bar }}
            >
              <div className="order-head">
                <div className="order-name">{o.name}</div>
                <div className="order-meta">
                  {o.code} · {time}
                </div>
              </div>
              <div className="order-items">{itemsLabel}</div>
              {o.note && <div className="order-note">“{o.note}”</div>}
              <div className="order-actions">
                <span className={`pay-tag ${o.pay === 'qr' ? 'pay-tag-qr' : 'pay-tag-cash'}`}>
                  {o.pay === 'qr' ? 'QR' : 'เงินสด · Cash'}
                </span>
                <span className="order-total">{o.total}฿</span>
                <div className="order-spacer" />
                <button
                  type="button"
                  className="advance-btn"
                  style={{ background: st.bar }}
                  onClick={() => advance(o)}
                >
                  {st.btn}
                </button>
                <button type="button" className="remove-btn" onClick={() => remove(o)}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loaded && orders.length === 0 && (
        <div className="empty-queue">ยังไม่มีออเดอร์ · no orders yet</div>
      )}
    </div>
  );
}
