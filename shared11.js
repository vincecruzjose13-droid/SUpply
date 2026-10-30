// shared11.js - small tools used by BOTH the student page and the admin page.
// Reservations are saved in this browser's localStorage under one name (KEY).
const KEY = "supplytrack-reservations";
const money = n => "₱" + Number(n).toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function loadReservations() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function saveReservations(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
function makeCode() {   // looks like ST-ABCD-1234
  const L = "ABCDEFGHJKLMNPQRSTUVWXYZ", pick = () => L[Math.floor(Math.random() * L.length)];
  return "ST-" + pick() + pick() + pick() + pick() + "-" + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

// Products: saved in the browser so the seller can add items. First time = the sample list in products11.js.
const PKEY = "supplytrack-products";
function loadProducts() {
  try { const list = JSON.parse(localStorage.getItem(PKEY)); if (Array.isArray(list)) return list; } catch (e) {}
  return PRODUCTS;
}
function saveProducts(list) { try { localStorage.setItem(PKEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
