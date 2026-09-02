# Coffee shop menu page

_Started 2026-09-02 02:51 UTC_

---

## User

I need a page for my business. I sell coffee made order by order. Coffee can be chosen either dripped or moka pot, beans option from Chiangrai or Nan. Might have more menu in the future.

## Assistant



## User

I need a page for my business. I sell coffee made order by order. Coffee can be chosen either dripped or moka pot, beans option from Chiangrai or Nan. Might have more menu in the future. I want a minimal and friendly website that includes: available menu, options where people can click to order, choose their coffee. My goal is to let people order my coffee and other menu, so I can track what order to make and who that order, and make payment by either QR code payment or cash. The website should be mobile user friendly.

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on your answers — mainly the shop name, prices, and whether you want a barista queue view. Once those land I'll build it.

## User

Answered — design_system: Picked a design system (now attached); shop_name: forti.; language: Both (Thai + English); prices: Drip 45, Moka Pot 45; customer_info: Name, Note to barista; fulfilment: I deliver / hand it over; order_sent: Just show the QR to pay + confirmation; tracking: Yes — a queue screen with order status; future_menu: Brownie, Latte, Iced chocolate

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: dc_write]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Built as a single mobile-width page in your Organic system, Thai + English throughout:

- **Menu** — black coffee 45฿ with Drip/Moka and Chiangrai/Nan pickers; Latte, Iced chocolate, Brownie sit below as "soon" placeholders you can promote later.
- **Order** — cart with quantities, name, note to barista, QR or cash. Sticky total bar at the bottom.
- **Confirmation** — order code, summary, and a PromptPay QR slot (drop your real QR image in to replace the placeholder).
- **Barista queue** — link at top right; orders persist on the device and cycle New → Making → Done.

Orders are stored locally in the browser, so the queue only shows on the device the order was placed from. If you want orders from customers' phones to reach your queue, that needs a backend — say the word and I'll wire in a form/chat handoff instead.

## User

add qr code picture

## Assistant

_[tool: dc_html_str_replace]_

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Your QR is now on the confirmation screen when a customer picks PromptPay.

