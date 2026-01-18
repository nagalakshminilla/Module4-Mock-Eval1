const express = require("express");
const fs = require("fs");

const router = express.Router();

const readDB = () => {
  return JSON.parse(fs.readFileSync("db.json", "utf-8"));
};


router.get("/allorders", (req, res) => {
  const db = readDB();
  let count = 0;

  db.orders.forEach(() => {
    count++;
  });

  res.status(200).json({
    totalOrders: count,
    orders: db.orders
  });
});

router.get("/cancelled-orders", (req, res) => {
  const db = readDB();

  const cancelledOrders = db.orders.filter(order => {
    return order.status === "cancelled";
  });

  res.status(200).json({
    count: cancelledOrders.length,
    orders: cancelledOrders
  });
});


router.get("/shipped", (req, res) => {
  const db = readDB();

  const shippedOrders = db.orders.filter(order => {
    return order.status === "shipped";
  });

  res.status(200).json({
    count: shippedOrders.length,
    orders: shippedOrders
  });
});


router.get("/total-revenue/:productId", (req, res) => {
  const db = readDB();
  const productId = Number(req.params.productId);

  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  const totalRevenue = db.orders
    .filter(order => {
      return (
        order.productId === productId &&
        order.status !== "cancelled"
      );
    })
    .reduce((sum, order) => {
      return sum + order.quantity * product.price;
    }, 0);

  res.status(200).json({
    productId,
    totalRevenue
  });
});


router.get("/alltotalrevenue", (req, res) => {
  const db = readDB();

  const totalRevenue = db.orders
    .filter(order => order.status !== "cancelled")
    .reduce((sum, order) => {
      const product = db.products.find(p => p.id === order.productId);
      return sum + order.quantity * product.price;
    }, 0);

  res.status(200).json({
    totalRevenue
  });
});

module.exports = router;
