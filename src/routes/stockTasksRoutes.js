const express = require("express");
const {
  getStockTasks,
  createStockTask,
  updateStockTask,
} = require("../controllers/stockController");

const router = express.Router();

router.get("/stock-tasks", getStockTasks);
router.post("/stock-tasks", createStockTask);
router.put("/stock-tasks/:taskNumber", updateStockTask);

module.exports = router;