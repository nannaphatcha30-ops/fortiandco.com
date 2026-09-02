import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { PRICE, findBrew, findBean, itemLabel } from '../shared/menu.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

function serializeOrder(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    note: row.note,
    pay: row.pay,
    status: row.status,
    total: row.total,
    items: JSON.parse(row.items),
    createdAt: row.created_at,
  };
}

app.get('/api/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  res.json(rows.map(serializeOrder));
});

app.get('/api/orders/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(serializeOrder(row));
});

app.post('/api/orders', (req, res) => {
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
  const createdAt = new Date().toISOString();

  const info = db
    .prepare(
      'INSERT INTO orders (code, name, note, pay, status, total, items, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run('', name, note, pay, 'new', total, JSON.stringify(items), createdAt);

  const code = '#' + String(100 + (info.lastInsertRowid % 900));
  db.prepare('UPDATE orders SET code = ? WHERE id = ?').run(code, info.lastInsertRowid);

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(serializeOrder(row));
});

app.patch('/api/orders/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  const status = req.body?.status;
  if (!['new', 'making', 'done'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(serializeOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)));
});

app.delete('/api/orders/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`forti & co. server listening on http://localhost:${PORT}`);
});
