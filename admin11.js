// admin11.js - the seller page. Reads and updates the reservations saved in this browser.
const NEXT = { "Pending": ["Confirmed", "Rejected"], "Confirmed": ["Preparing", "Rejected"], "Preparing": ["Ready for pickup"], "Ready for pickup": ["Completed", "Expired"] };
const STATUSES = ["Pending", "Confirmed", "Preparing", "Ready for pickup", "Completed", "Rejected", "Expired", "Cancelled"];
const $ = id => document.getElementById(id);
const pill = s => ({ Pending: "limited", Rejected: "unavailable", Expired: "unavailable", Cancelled: "unavailable" }[s] || "available");

function card(r) {
  const total = r.items.reduce((s, i) => s + i.qty * i.price, 0);
  const lines = r.items.map(i => `${i.qty} x ${esc(i.name)} (${money(i.qty * i.price)})`).join("<br>");
  const btns = (NEXT[r.status] || []).map(s => `<button class="btn ${s === "Rejected" ? "danger" : ""}" data-code="${esc(r.code)}" data-to="${s}">${s === "Rejected" ? "Reject" : "Mark " + s}</button>`).join("");
  return `<article class="reservation-card"><div class="reservation-head"><div><h3>${esc(r.code)}</h3>
    <p>${esc(r.name)} (${esc(r.student_id)}) · ${esc(r.email)} · Pickup: ${esc(r.pickup)}<br>${esc(new Date(r.created_at).toLocaleString())}</p></div><span class="status ${pill(r.status)}">${esc(r.status)}</span></div>
    <p class="items">${lines}<br><strong>Estimated total: ${money(total)}</strong></p>
    ${r.status === "Pending" ? '<p class="tiny">Check the real shelf before confirming.</p>' : ""}
    ${r.reason ? `<p class="tiny">Reason: ${esc(r.reason)}</p>` : ""}<div class="reservation-actions">${btns}</div></article>`;
}
function render() {
  const all = loadReservations().reverse();   // newest first
  $("sync-note").textContent = "Last updated: " + new Date().toLocaleTimeString();
  const n = s => all.filter(r => r.status === s).length;
  $("pending-count").textContent = n("Pending"); $("active-count").textContent = n("Confirmed") + n("Preparing"); $("ready-count").textContent = n("Ready for pickup");
  const f = $("filter").value, q = $("req-search").value.trim().toLowerCase();
  const shown = all.filter(r => (f === "All" || r.status === f) && [r.code, r.name, r.student_id].some(t => t.toLowerCase().includes(q)));
  $("reservations-list").innerHTML = shown.map(card).join("") || "<p>No reservations yet.</p>";
}
$("reservations-list").addEventListener("click", e => {   // the status buttons
  const code = e.target.dataset.code, to = e.target.dataset.to; if (!code) return;
  let reason = "";
  if (to === "Rejected") { reason = (prompt("Why is this being rejected? (the student sees this)") || "").trim(); if (!reason) return; }
  const list = loadReservations(), r = list.find(x => x.code === code);
  if (!r || !(NEXT[r.status] || []).includes(to)) return;   // only allowed steps
  r.status = to; r.reason = reason || r.reason; r.history.push({ status: to, at: new Date().toISOString() });
  saveReservations(list); render();
});
$("clear-btn").addEventListener("click", () => { if (confirm("Delete ALL saved reservations in this browser?")) { saveReservations([]); render(); } });
$("filter").addEventListener("change", render);
$("req-search").addEventListener("input", render);
window.addEventListener("storage", e => { if (e.key === KEY || e.key === null) render(); });   // another window saved new data
$("filter").innerHTML = "<option>All</option>" + STATUSES.map(s => `<option>${s}</option>`).join("");
render();

/* ---------- Products: add, change availability, remove ---------- */
function renderProducts() {
  const list = loadProducts();
  $("cats").innerHTML = [...new Set(list.map(p => p.category))].sort().map(c => `<option value="${esc(c)}">`).join("");
  $("product-list").innerHTML = list.map(p => `<div class="admin-row"><strong class="grow">${esc(p.name)}</strong><span>${esc(p.category)}</span><span>${money(p.price)}</span>
    <select class="catalogdropdown" data-id="${p.id}" aria-label="Availability">${["Available", "Limited", "Unavailable"].map(a => `<option ${p.availability === a ? "selected" : ""}>${a}</option>`).join("")}</select>
    <button class="btn danger" data-del="${p.id}" type="button">Remove</button></div>`).join("") || "<p>No products yet.</p>";
}
$("add-form").addEventListener("submit", e => {
  e.preventDefault();
  const list = loadProducts(), name = $("new-name").value.trim(), category = $("new-category").value.trim();
  const price = Number($("new-price").value), max = Number($("new-max").value);
  let msg = "";
  if (!name || !category) msg = "Fill in the name and category.";
  else if (!(price > 0)) msg = "Price must be above 0.";
  else if (!Number.isInteger(max) || max < 1 || max > 50) msg = "Max per student must be 1 to 50.";
  else if (list.some(p => p.name.toLowerCase() === name.toLowerCase())) msg = "That product already exists.";
  $("add-err").textContent = msg; if (msg) return;
  list.push({ id: Math.max(0, ...list.map(p => p.id)) + 1, name: name, category: category, price: price, max_qty: max, availability: $("new-avail").value, image_url: null });
  saveProducts(list); $("add-form").reset(); renderProducts();
});
$("product-list").addEventListener("change", e => {   // the availability dropdown
  const id = e.target.dataset.id; if (!id) return;
  const list = loadProducts(); list.find(p => p.id === Number(id)).availability = e.target.value; saveProducts(list);
});
$("product-list").addEventListener("click", e => {   // the Remove button
  const id = e.target.dataset.del; if (!id || !confirm("Remove this product?")) return;
  saveProducts(loadProducts().filter(p => p.id !== Number(id))); renderProducts();
});
renderProducts();
