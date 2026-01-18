const express = require("express");
const router = express.Router();
const fs = require("fs");

const readDB = () => JSON.parse(fs.readFileSync("db.json"));

router.get("/", (req, res) => {
  const db = readDB();
  res.status(200).json({ products: db.products });
});

module.exports = router;
