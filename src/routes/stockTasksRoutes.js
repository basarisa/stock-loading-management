const express = require("express");
const {
  getStockTasks,
  createStockTask,
  updateStockTask,
} = require("../controllers/stockController");

const router = express.Router();

/**
 * @swagger
 * /stock-tasks:
 *   get:
 *     summary: Get all stock tasks
 *     responses:
 *       200:
 *         description: A list of stock tasks
 */
router.get("/stock-tasks", getStockTasks);

/**
 * @swagger
 * /stock-tasks:
 *   post:
 *     summary: Create a new stock task
 *     responses:
 *       201:
 *         description: Stock task created successfully
 */
router.post("/stock-tasks", createStockTask);

/**
 * @swagger
 * /stock-tasks/{taskNumber}:
 *   put:
 *     summary: Update the status of a stock task
 *     parameters:
 *       - name: taskNumber
 *         in: path
 *         required: true
 *         description: The task number to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock task updated successfully
 */
router.put("/stock-tasks/:taskNumber", updateStockTask);

module.exports = router;
