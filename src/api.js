const BASE = '/api/orders';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function listOrders() {
  return request(BASE);
}

export function getOrder(id) {
  return request(`${BASE}/${id}`);
}

export function createOrder({ name, note, pay, items }) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, note, pay, items }),
  });
}

export function updateOrderStatus(id, status) {
  return request(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function deleteOrder(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' });
}
