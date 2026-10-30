// products11.js - the catalog data, written directly in JavaScript. No database.
// After the seller adds products in admin11.html, the browser keeps its own saved list and this sample list is only the starting point.
// SAMPLE items: replace the names and prices with your real shop's list.
// availability must be exactly: "Available", "Limited" or "Unavailable".
// max_qty = the most one student can add to the cart.
const PRODUCTS = [
  { id: 1, name: "Notebook (80 leaves)",  category: "Paper",    price: 25,  max_qty: 10, availability: "Available",   image_url: null },
  { id: 2, name: "Yellow Pad",            category: "Paper",    price: 45,  max_qty: 10, availability: "Available",   image_url: null },
  { id: 3, name: "Bond Paper (short)",    category: "Paper",    price: 3,   max_qty: 20, availability: "Limited",     image_url: null },
  { id: 4, name: "Ballpen (black)",       category: "Writing",  price: 10,  max_qty: 20, availability: "Available",   image_url: null },
  { id: 5, name: "Pencil #2",             category: "Writing",  price: 8,   max_qty: 20, availability: "Available",   image_url: null },
  { id: 6, name: "Highlighter",           category: "Writing",  price: 30,  max_qty: 5,  availability: "Limited",     image_url: null },
  { id: 7, name: "Ruler (30 cm)",         category: "Tools",    price: 15,  max_qty: 5,  availability: "Available",   image_url: null },
  { id: 8, name: "Scientific Calculator", category: "Tools",    price: 450, max_qty: 1,  availability: "Unavailable", image_url: null },
  { id: 9, name: "Folder (long)",         category: "Filing",   price: 12,  max_qty: 10, availability: "Available",   image_url: null },
  { id: 10, name: "Eraser",             category: "Writing", price: 7,  max_qty: 10, availability: "Available", image_url: null },
  { id: 11, name: "Scissors",           category: "Tools",   price: 35, max_qty: 3,  availability: "Available", image_url: null },
  { id: 12, name: "Index Cards (pack)", category: "Paper",   price: 20, max_qty: 10, availability: "Available", image_url: null }
];
