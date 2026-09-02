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

app.get('/api/orders', async (req, res) => {
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

  res.status(201).json(serializeOrder(rows[0]));
});

app.patch('/api/orders/:id', async (req, res) => {
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

app.delete('/api/orders/:id', async (req, res) => {
  await sql`DELETE FROM orders WHERE id = ${req.params.id}`;
  res.status(204).end();
});

export default app;
