import express from 'express';
import { sql, ensureSchema } from './db.js';
import { PRICE, findBrew, findBean, itemLabel } from '../shared/menu.js';

const app = express();
app.use(express.json());
app.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (e) {
    next(e);
  }
});

function requireBarista(req, res, next) {
  const expected = process.env.BARISTA_PASSWORD;
  if (!expected) return res.status(401).json({ error: 'barista password not configured on server' });
  if (req.get('x-barista-password') !== expected) {
    return res.status(401).json({ error: 'wrong password' });
  }
  next();
}

async function notifyTelegram(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const itemsText = order.items.map((i) => `${i.qty}× ${i.label}`).join('\n');
  const payText = order.pay === 'qr' ? 'PromptPay QR' : 'Cash';
  const text =
    `☕ New order ${order.code}\n` +
    `${order.name}\n` +
    `${itemsText}\n` +
    `${order.total}฿ · ${payText}` +
    (order.note ? `\nNote: ${order.note}` : '');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.error('telegram notify failed:', e);
  }
}

function serializeOrder(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    note: row.note,
    pay: row.pay,
    status: row.status,
    total: row.total,
    items: row.items,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

app.get('/api/orders', requireBarista, async (req, res) => {
  const { rows } = await sql`SELECT * FROM orders ORDER BY id DESC`;
  res.json(rows.map(serializeOrder));
});

app.get('/api/orders/:id', async (req, res) => {
  const { rows } = await sql`SELECT * FROM orders WHERE id = ${req.params.id}`;
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(serializeOrder(rows[0]));
});

app.post('/api/orders', async (req, res) => {
  const body = req.body || {};
  const cartItems = Array.isArray(body.items) ? body.items : [];
  if (!cartItems.length) return res.status(400).json({ error: 'cart is empty' });

  const items = [];
  let total = 0;
  for (const raw of cartItems) {
    const brew = findBrew(raw?.brew);
    const bean = findBean(raw?.bean);
    const qty = Number(raw?.qty);
    if (!brew || !bean || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'invalid cart item' });
    }
    const l = itemLabel(brew.id, bean.id);
    const line = qty * PRICE;
    total += line;
    items.push({ label: `${l.title} / ${l.sub.split(' · ')[0]}`, short: l.short, qty, line: `${line}฿` });
  }

  const pay = body.pay === 'cash' ? 'cash' : 'qr';
  const name = String(body.name || '').trim() || 'ลูกค้า · Guest';
  const note = String(body.note || '').trim();

  const inserted = await sql`
    INSERT INTO orders (code, name, note, pay, status, total, items)
    VALUES ('', ${name}, ${note}, ${pay}, 'new', ${total}, ${JSON.stringify(items)}::jsonb)
    RETURNING id
  `;
  const id = inserted.rows[0].id;
  const code = '#' + String(100 + (id % 900));
  const { rows } = await sql`UPDATE orders SET code = ${code} WHERE id = ${id} RETURNING *`;
  const order = serializeOrder(rows[0]);

  await notifyTelegram(order);

  res.status(201).json(order);
});

app.patch('/api/orders/:id', requireBarista, async (req, res) => {
  const status = req.body?.status;
  if (!['new', 'making', 'done'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows } = await sql`
    UPDATE orders SET status = ${status} WHERE id = ${req.params.id} RETURNING *
  `;
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(serializeOrder(rows[0]));
});

app.delete('/api/orders/:id', requireBarista, async (req, res) => {
  await sql`DELETE FROM orders WHERE id = ${req.params.id}`;
  res.status(204).end();
});

export default app;
