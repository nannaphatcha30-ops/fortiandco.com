// Menu data shared between the client (src/) and the server (server/) so
// prices and labels can never drift between what's shown and what's charged.

export const PRICE = 45;

export const BREWS = [
  { id: 'drip', th: 'ดริป', en: 'Drip' },
  { id: 'moka', th: 'มอคค่าพอต', en: 'Moka pot' },
];

export const BEANS = [
  { id: 'chiangrai', th: 'เชียงราย', en: 'Chiangrai', note: 'chocolate, nutty' },
  { id: 'nan', th: 'น่าน', en: 'Nan', note: 'fruity, floral' },
];

export const PAYS = [
  { id: 'qr', th: 'สแกน QR', en: 'PromptPay QR' },
  { id: 'cash', th: 'เงินสด', en: 'Cash' },
];

export const SOON_ITEMS = [
  { th: 'ลาเต้', en: 'Latte' },
  { th: 'ช็อกโกแลตเย็น', en: 'Iced chocolate' },
  { th: 'บราวนี่', en: 'Brownie' },
];

export const STATUSES = {
  new: { label: 'รอชง · New', next: 'making', btn: 'เริ่มชง · Start', bg: '#f9f4ed', bar: '#c67139' },
  making: { label: 'กำลังชง · Making', next: 'done', btn: 'เสร็จแล้ว · Done', bg: '#fff2eb', bar: '#c67139' },
  done: { label: 'เสร็จ · Done', next: 'new', btn: 'คืนคิว · Reopen', bg: '#f0fae1', bar: '#7a8a5e' },
};

export function findBrew(id) {
  return BREWS.find((b) => b.id === id);
}

export function findBean(id) {
  return BEANS.find((n) => n.id === id);
}

export function itemLabel(brewId, beanId) {
  const b = findBrew(brewId);
  const n = findBean(beanId);
  return {
    title: `${b.th} · ${b.en}`,
    sub: `เมล็ด ${n.th} · ${n.en} beans`,
    short: `${b.en} ${n.th}`,
  };
}
