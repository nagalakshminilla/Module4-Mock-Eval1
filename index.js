const express = require("express");
const app = express();

app.use(express.json());

const productRoutes = require("./routes/products.routes");
const orderRoutes = require("./routes/orders.routes");
const analyticsRoutes = require("./routes/analytics.routes");

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/analytics", analyticsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
