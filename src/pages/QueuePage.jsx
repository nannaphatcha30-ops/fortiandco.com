import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STATUSES } from '../../shared/menu.js';
import { listOrders, updateOrderStatus, deleteOrder } from '../api.js';

const POLL_MS = 4000;

export default function QueuePage() {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    listOrders()
      .then((rows) => {
        setOrders(rows);
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const advance = (order) => {
    const next = STATUSES[order.status].next;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    updateOrderStatus(order.id, next).then(refresh).catch(refresh);
  };

  const remove = (order) => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    deleteOrder(order.id).then(refresh).catch(refresh);
  };

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
