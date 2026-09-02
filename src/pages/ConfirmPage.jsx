import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../api.js';

export default function ConfirmPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrder(id)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Order not found.');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="confirm-page">
        <div className="confirm-brand">forti.</div>
        <div className="empty-note">{error}</div>
        <button type="button" className="again-btn" onClick={() => navigate('/')}>
          สั่งอีกแก้ว · Order another
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="confirm-page">
      <div className="confirm-brand">forti.</div>
      <div className="confirm-check">✓</div>
      <div className="confirm-title">รับออเดอร์แล้ว!</div>
      <div className="confirm-sub">
        Got it, {order.name} — I'm making it now. Order <strong>{order.code}</strong>.
      </div>

      <div className="summary-card">
        {order.items.map((item, i) => (
          <div className="summary-row" key={i}>
            <div>
              {item.qty}× {item.label}
            </div>
            <div className="summary-row-sub">{item.line}</div>
          </div>
        ))}
        <div className="summary-hr" />
        <div className="summary-total">
          <div>รวม · Total</div>
          <div>{order.total}฿</div>
        </div>
      </div>

      {order.pay === 'qr' ? (
        <div className="qr-card">
          <div className="qr-title">สแกนจ่าย · Scan to pay</div>
          <div className="qr-sub">
            PromptPay · {order.total}฿
          </div>
          <img src="/promptpay-qr.jpg" alt="PromptPay QR" className="qr-img" />
        </div>
      ) : (
        <div className="cash-card">
          <div className="cash-title">จ่ายเงินสด · Pay cash</div>
          <div className="cash-sub">Hand me {order.total}฿ when I bring your coffee over.</div>
        </div>
      )}

      <button type="button" className="again-btn" onClick={() => navigate('/')}>
        สั่งอีกแก้ว · Order another
      </button>
    </div>
  );
}
