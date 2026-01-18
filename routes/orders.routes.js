const express = require("express");
const fs = require("fs");

const router = express.Router();

/* helper functions */
const readDB = () =>
  JSON.parse(fs.readFileSync("db.json", "utf-8"));

const writeDB = (data) =>
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));

router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  const db = readDB();

  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock === 0 || quantity > product.stock) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  const totalAmount = product.price * quantity;

  const newOrder = {
    id: db.orders.length + 1,
    productId,
    quantity,
    totalAmount,
    status: "placed",
    createdAt: new Date().toISOString().split("T")[0]
  };

  product.stock -= quantity;
  db.orders.push(newOrder);

  writeDB(db);
  res.status(201).json({ message: "Order placed", order: newOrder });
});

router.get("/", (req, res) => {
  const db = readDB();
  res.status(200).json({ orders: db.orders });
});


router.delete("/:orderId", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  const today = new Date().toISOString().split("T")[0];
  if (order.createdAt !== today || order.status === "cancelled") {
    return res.status(400).json({ message: "Cannot cancel order" });
  }

  order.status = "cancelled";

  const product = db.products.find(p => p.id === order.productId);
  product.stock += order.quantity;

  writeDB(db);
  res.status(200).json({ message: "Order cancelled", order });
});


router.patch("/change-status/:orderId", (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id == req.params.orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status === "cancelled" || order.status === "delivered") {
    return res.status(400).json({ message: "Status cannot be changed" });
  }

  const statusFlow = ["placed", "shipped", "delivered"];
  const nextStatus =
    statusFlow[statusFlow.indexOf(order.status) + 1];

  order.status = nextStatus;
  writeDB(db);

  res.status(200).json({ message: "Status updated", order });
});


router.get("/allorders", (req, res) => {
  const db = readDB();
  let count = 0;

  db.orders.forEach(() => count++);

  res.json({ count, orders: db.orders });
});


router.get("/cancelled-orders", (req, res) => {
  const db = readDB();
  const cancelled = db.orders.filter(o => o.status === "cancelled");

  res.json({ count: cancelled.length, cancelled });
});


router.get("/shipped", (req, res) => {
  const db = readDB();
  const shipped = db.orders.filter(o => o.status === "shipped");

  res.json({ count: shipped.length, shipped });
});

router.get("/total-revenue/:productId", (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id == req.params.productId);

  if (!product) return res.status(404).json({ message: "Product not found" });

  const totalRevenue = db.orders
    .filter(o => o.productId == product.id && o.status !== "cancelled")
    .reduce((sum, o) => sum + o.quantity * product.price, 0);

  res.json({ productId: product.id, totalRevenue });
});


module.exports = router;