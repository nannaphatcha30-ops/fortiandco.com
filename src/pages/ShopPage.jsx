import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BREWS, BEANS, PAYS, PRICE, SOON_ITEMS, itemLabel } from '../../shared/menu.js';
import { createOrder } from '../api.js';

export default function ShopPage() {
  const navigate = useNavigate();
  const [brew, setBrew] = useState(BREWS[0].id);
  const [bean, setBean] = useState(BEANS[0].id);
  const [pay, setPay] = useState(PAYS[0].id);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = () => {
    const key = `${brew}-${bean}`;
    setCart((prev) => {
      const found = prev.find((c) => c.key === key);
      if (found) return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { key, brew, bean, qty: 1 }];
    });
  };

  const bump = (key, delta) => {
    setCart((prev) =>
      prev.map((c) => (c.key === key ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0)
    );
  };

  const total = cart.reduce((sum, c) => sum + c.qty * PRICE, 0);

  const placeOrder = async () => {
    if (!cart.length || placing) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await createOrder({
        name,
        note,
        pay,
        items: cart.map((c) => ({ brew: c.brew, bean: c.bean, qty: c.qty })),
      });
      navigate(`/confirm/${order.id}`);
    } catch (e) {
      setError(e.message || 'Could not place order — try again.');
      setPlacing(false);
    }
  };

  return (
    <div>
      <div className="shop-body">
        <div className="topbar">
          <div className="brand">forti &amp; co.</div>
          <Link to="/queue" className="link-btn">
            บาริสต้า · Barista
          </Link>
        </div>

        <div className="hero">
          <div className="hero-title">Made to order</div>
          <div className="hero-sub">Made one cup at a time. Fresh beans from northern Thailand.</div>
          <div className="badges">
            <span className="badge badge-green">&nbsp;hand delivered</span>
            <span className="badge badge-peach">{PRICE}฿</span>
          </div>
        </div>

        <div className="section-label">เมนู · Menu</div>

        <div className="menu-card">
          <div className="menu-head">
            <div className="menu-title">Black coffee</div>
            <div className="menu-price">{PRICE}฿</div>
          </div>
          <div className="menu-sub">Choose your brew and beans.</div>

          <div className="group-label">วิธีชง · Brew</div>
          <div className="pick-grid">
            {BREWS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`pick${brew === b.id ? ' is-on' : ''}`}
                onClick={() => setBrew(b.id)}
              >
                <div className="pick-en">{b.en}</div>
                <div className="pick-th">{b.th}</div>
              </button>
            ))}
          </div>

          <div className="group-label">เมล็ดกาแฟ · Beans</div>
          <div className="bean-grid">
            {BEANS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`pick${bean === n.id ? ' is-on' : ''}`}
                onClick={() => setBean(n.id)}
              >
                <div className="bean-row">
                  <div className="bean-en">{n.en}</div>
                  <div className="bean-th">{n.th}</div>
                </div>
                <div className="bean-note">{n.note}</div>
              </button>
            ))}
          </div>

          <button type="button" className="add-btn" onClick={addToCart}>
            เพิ่มลงออเดอร์ · Add to order
          </button>
        </div>

        <div className="soon-list">
          {SOON_ITEMS.map((s) => (
            <div className="soon-item" key={s.en}>
              <div>
                <div className="soon-title">{s.th}</div>
                <div className="soon-sub">{s.en}</div>
              </div>
              <span className="soon-tag">เร็วๆ นี้ · soon</span>
            </div>
          ))}
        </div>

        {cart.length > 0 ? (
          <>
            <div className="section-label">ออเดอร์ของคุณ · Your order</div>
            <div className="cart-card">
              {cart.map((c) => {
                const l = itemLabel(c.brew, c.bean);
                return (
                  <div className="cart-row" key={c.key}>
                    <div className="cart-info">
                      <div className="cart-title">{l.title}</div>
                      <div className="cart-sub">{l.sub}</div>
                    </div>
                    <div className="qty-controls">
                      <button type="button" className="qty-btn" onClick={() => bump(c.key, -1)}>
                        −
                      </button>
                      <div className="qty-value">{c.qty}</div>
                      <button type="button" className="qty-btn" onClick={() => bump(c.key, 1)}>
                        +
                      </button>
                    </div>
                    <div className="cart-line">{c.qty * PRICE}฿</div>
                  </div>
                );
              })}
            </div>

            <div className="fields">
              <div>
                <label className="field-label">ชื่อ · Your name</label>
                <input
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">ถึงบาริสต้า · Note to barista</label>
                <textarea
                  className="field-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="หวานน้อย/ เพิ่มช๊อต"
                />
              </div>
            </div>

            <div className="pay-label">ชำระเงิน · Payment</div>
            <div className="pay-grid">
              {PAYS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`pick${pay === p.id ? ' is-on' : ''}`}
                  onClick={() => setPay(p.id)}
                >
                  <div className="pay-th">{p.th}</div>
                  <div className="pay-en">{p.en}</div>
                </button>
              ))}
            </div>

            {error && (
              <div className="empty-note" style={{ color: '#b00020', opacity: 1 }}>
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="empty-note">ยังไม่มีรายการ · nothing in your order yet</div>
        )}
      </div>

      <div className="bottom-bar">
        <div className="total-block">
          <div className="total-label">รวม · Total</div>
          <div className="total-value">{total}฿</div>
        </div>
        <button
          type="button"
          className="place-btn"
          disabled={cart.length === 0 || placing}
          onClick={placeOrder}
        >
          สั่งเลย · Place order
        </button>
      </div>
    </div>
  );
}
