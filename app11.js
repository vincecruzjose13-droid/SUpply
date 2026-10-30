// app11.js - the student page. Plain JavaScript only: no database, no server.
// Products come from loadProducts() in shared11.js.

let products = loadProducts();   // the catalog (the seller can add items)
let cart = {};             // {productId: quantity}. Saved in this browser only.
let current = null;       // the receipt on screen: {code}
let shown = 12;            // how many catalog items are on screen right now

const $ = id => document.getElementById(id);
function debounce(fn, ms) { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; }
function picture(p) {   // the photo, or a colored tile with the first letter
  if (p.image_url) return `<img class="thumb" loading="lazy" src="${esc(p.image_url)}" alt="${esc(p.name)}">`;
  return `<span class="thumb tile tile${p.id % 5}">${esc(p.name.charAt(0).toUpperCase())}</span>`;
}
const limitFor = id => { const p = products.find(x => x.id === Number(id)); return p ? p.max_qty : 10; };

/* ---------- Saving the cart in this browser ---------- */
function saveCart() { try { localStorage.setItem("supplytrack-cart", JSON.stringify(cart)); } catch (e) {} }
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem("supplytrack-cart")) || {}; } catch (e) { cart = {}; }
  for (const id in cart) {   // throw away anything that is not a real product or a sane quantity
    const p = products.find(x => x.id === Number(id));
    if (!p || !Number.isInteger(cart[id]) || cart[id] < 1) delete cart[id]; else cart[id] = Math.min(cart[id], p.max_qty);
  }
}

/* ---------- Catalog ---------- */
function fillCategories() {
  const cats = [...new Set(products.map(p => p.category))].sort();
  $("category").innerHTML = '<option value="All">All categories</option>' + cats.map(c => `<option>${esc(c)}</option>`).join("");
}
function renderProducts() {
  const q = $("search").value.trim().toLowerCase(), cat = $("category").value;
  const list = products.filter(p => (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (cat === "All" || p.category === cat));
  const by = $("sort").value;
  if (by === "low") list.sort((a, b) => a.price - b.price);
  else if (by === "high") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => a.name.localeCompare(b.name));
  const visible = list.slice(0, shown);
  $("item-count").textContent = visible.length + " of " + list.length + " items shown";
  $("more-btn").classList.toggle("hidden", visible.length >= list.length);
  $("products").innerHTML = visible.map(p => `<article class="product">
    <div class="product-img">${picture(p)}</div>
    <div class="product-top"><span class="status ${p.availability.toLowerCase()}">${p.availability}</span></div>
    <h3>${esc(p.name)}</h3><span class="category-label">${esc(p.category)}</span>
    <div class="product-bottom"><span class="price">${money(p.price)}</span>
    <button class="small-button" data-add="${p.id}" ${p.availability === "Unavailable" ? "disabled" : ""}>Add to cart</button></div></article>`).join("") || "<p>No supplies match your search.</p>";
}
function refilter() { shown = 12; renderProducts(); }

/* ---------- Cart ---------- */
function renderCart() {
  const rows = Object.keys(cart).map(id => ({ p: products.find(x => x.id === Number(id)), qty: cart[id] })).filter(r => r.p);
  const n = rows.reduce((s, r) => s + r.qty, 0);
  $("cart-count").textContent = n + (n === 1 ? " item" : " items");
  $("cart-items").innerHTML = rows.length ? rows.map(r => `<div class="cart-row">${picture(r.p)}
    <div class="grow"><strong>${esc(r.p.name)}</strong><small>${money(r.p.price)} each = ${money(r.p.price * r.qty)}</small></div>
    <div class="qty"><button type="button" data-qty="${r.p.id}" data-d="-1">-</button><strong>${r.qty}</strong><button type="button" data-qty="${r.p.id}" data-d="1">+</button></div></div>`).join("")
    : '<p class="mutedreservation">Your cart is empty. Add supplies from the catalog.</p>';
  $("cart-total").textContent = rows.length ? "Estimated total: " + money(rows.reduce((s, r) => s + r.p.price * r.qty, 0)) : "";
  saveCart();
}
$("products").addEventListener("click", e => {   // "Add to cart" buttons
  const id = e.target.dataset.add; if (!id) return;
  cart[id] = Math.min((cart[id] || 0) + 1, limitFor(id)); renderCart();
});
$("cart-items").addEventListener("click", e => {   // the + and - buttons
  const id = e.target.dataset.qty; if (!id) return;
  cart[id] = Math.min(Math.max((cart[id] || 0) + Number(e.target.dataset.d), 0), limitFor(id));
  if (!cart[id]) delete cart[id]; renderCart();
});

/* ---------- Reservation form ---------- */
function showMsg(text, isError) { const m = $("reservation-result"); m.className = "result" + (isError ? " error" : ""); m.textContent = text; }
function validate(v) {
  const err = {};
  if (v("student-name").length < 2) err["student-name"] = "Enter your full name.";
  if (!/^\d{8}$/.test(v("student-id"))) err["student-id"] = "Student ID is 8 digits, like 20260001.";
  if (!/^\S+@\S+\.\S+$/.test(v("student-email"))) err["student-email"] = "Enter a valid email address.";
  if (!$("pickup-window").value) err["pickup-window"] = "Choose a pickup window.";
  if (!Object.keys(cart).length) err["cart"] = "Add at least one item first.";
  return err;
}
$("reservation-form").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => $(id).value.trim(), err = validate(v);
  ["student-name", "student-id", "student-email", "pickup-window", "cart"].forEach(k => $("err-" + k).textContent = err[k] || "");
  if (Object.keys(err).length) { showMsg("Please fix the messages in red.", true); return; }
  const items = Object.keys(cart).map(id => { const p = products.find(x => x.id === Number(id)); return { name: p.name, price: p.price, qty: cart[id] }; });
  const list = loadReservations();
  let code; do { code = makeCode(); } while (list.some(r => r.code === code));   // make sure the code is new
  const now = new Date().toISOString(), sid = v("student-id");
  list.push({ code: code, name: v("student-name"), student_id: sid, email: v("student-email"), pickup: $("pickup-window").value,
              status: "Pending", reason: "", created_at: now, items: items, history: [{ status: "Pending", at: now }] });
  if (!saveReservations(list)) { showMsg("Could not save in this browser. Storage may be blocked.", true); return; }
  cart = {}; renderCart(); $("reservation-form").reset();
  showMsg("Request saved! Your code is " + code + ". Write it down. It is NOT confirmed until the seller checks the shelf.", false);
  $("track-code").value = code; showLookup(code, true);
});

/* ---------- Receipt and lookup by code ---------- */
const TITLES = { Pending: "Reservation REQUEST - not confirmed yet", Confirmed: "Reservation confirmed by seller", Preparing: "Confirmed - being prepared", "Ready for pickup": "Ready for pickup", Completed: "Purchase completed", Rejected: "Request rejected", Expired: "Reservation expired", Cancelled: "Request cancelled" };
const STEPS = ["Pending", "Confirmed", "Preparing", "Ready for pickup", "Completed"];
function progressHtml(status) {   // boxes up to the current step turn green
  if (!STEPS.includes(status)) return "";
  const at = STEPS.indexOf(status);
  return '<ol class="progress">' + STEPS.map((s, i) => `<li class="${i <= at ? "done" : ""}">${s}</li>`).join("") + "</ol>";
}
function showReceipt(r, scroll) {
  const total = r.items.reduce((s, i) => s + i.qty * i.price, 0);
  const history = r.history.map(h => `<li>${esc(new Date(h.at).toLocaleString())} - ${esc(h.status)}</li>`).join("");
  $("receipt-view").innerHTML = `<div class="receipt"><p class="receipt-title">${esc(TITLES[r.status] || r.status)}</p><h3>${esc(r.code)}</h3>
    ${progressHtml(r.status)}<p>Requested: ${esc(new Date(r.created_at).toLocaleString())}<br>Name: ${esc(r.name)}<br>Pickup window: ${esc(r.pickup)}<br>Status: <b>${esc(r.status)}</b></p>
    ${r.reason ? `<p><b>Reason:</b> ${esc(r.reason)}</p>` : ""}
    <table><tr><th>Qty</th><th>Item</th><th>Each</th><th>Subtotal</th></tr>${r.items.map(i => `<tr><td>${i.qty}</td><td>${esc(i.name)}</td><td>${money(i.price)}</td><td>${money(i.price * i.qty)}</td></tr>`).join("")}</table>
    <p><b>Estimated total: ${money(total)}</b></p><p class="tiny">Prices and stock are checked by the seller. Payment is made at the shop.</p>
    <p class="tiny">This receipt updates by itself when the seller changes the status.</p><p class="tiny"><b>History</b></p><ul class="history">${history}</ul>
    <button class="btn noprint" onclick="window.print()">Print / Save as PDF</button></div>`;
  if (scroll) $("trackcontain").scrollIntoView({ behavior: "smooth" });
}
function showLookup(code, sid, scroll) {   // the code AND the student ID must both match
  const r = loadReservations().find(x => x.code === code.toUpperCase() && x.student_id.toLowerCase() === sid.toLowerCase());
  if (!r) { current = null; $("receipt-view").innerHTML = '<p class="err-box">No reservation matches that code and student ID on this browser.</p>'; return; }
  current = { code: r.code, sid: sid }; showReceipt(r, scroll);
}
$("track-form").addEventListener("submit", e => { e.preventDefault(); showLookup($("track-code").value.trim(), true); });

/* ---------- Start ---------- */
$("search").addEventListener("input", debounce(refilter, 200));
$("category").addEventListener("change", refilter);
$("sort").addEventListener("change", refilter);
$("more-btn").addEventListener("click", () => { shown += 12; renderProducts(); });
// the seller page (another window) changed the data: refresh the receipt on screen
window.addEventListener("storage", e => { if ((e.key === KEY || e.key === null) && current) showLookup(current.code, current.sid, false); });
loadCart(); fillCategories(); renderProducts(); renderCart();
