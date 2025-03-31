const supabase = require("../config/supabaseClient");

/**
 * @swagger
 * /stock-tasks:
 *   get:
 *     summary: Get a list of stock tasks
 *     description: Retrieve all stock tasks from the database
 *     responses:
 *       200:
 *         description: A list of stock tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tasknumber:
 *                     type: string
 *                   createdby:
 *                     type: string
 *                   assignedto:
 *                     type: string
 *                   product:
 *                     type: string
 *                   type:
 *                     type: string
 *                   status:
 *                     type: string
 *       500:
 *         description: Internal Server Error
 */

// ดึง Stock Tasks ทั้งหมด
const getStockTasks = async (req, res) => {
  const { data, error } = await supabase.from("stock_tasks").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

/**
 * @swagger
 * /stock-tasks:
 *   post:
 *     summary: Create a new stock task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tasknumber:
 *                 type: string
 *               createdby:
 *                 type: string
 *               assignedto:
 *                 type: string
 *               product:
 *                 type: string
 *               type:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               dimensions:
 *                 type: string
 *                 nullable: true
 *               weight:
 *                 type: string
 *                 nullable: true
 *               specialinstructions:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Stock task created successfully
 *       400:
 *         description: Task number already exists
 *       500:
 *         description: Internal Server Error
 */

const createStockTask = async (req, res) => {
  // TODO use JWT auth to get the requester role
  const requester = {
    role: "manager", // example role, replace with actual role from JWT
  };
  const {
    tasknumber,
    createdby,
    assignedto,
    product,
    type,
    description,
    dimensions,
    weight,
    specialinstructions,
  } = req.body;

  if (!["supervisor", "manager"].includes(requester.role)) {
    return res.status(403).json({
      error: "Permission denied, only manager or supervisor can create tasks ",
    });
  }

  // ตรวจสอบว่า tasknumber มีอยู่แล้วหรือไม่
  const { data: existingTask, error: checkError } = await supabase
    .from("stock_tasks")
    .select("tasknumber")
    .eq("tasknumber", tasknumber)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ error: checkError.message });
  }

  if (existingTask) {
    return res.status(400).json({ error: "Task number already exists" });
  }

  // Add validation for "Urgent Load" if needed
  if (type === "Urgent Load" && (!description || description.trim() === "")) {
    return res
      .status(400)
      .json({ error: "Description is required for Urgent Load" });
  }

  // If type is not "Urgent Load" but description is provided → Return an error and do not save.
  if (type !== "Urgent Load" && description) {
    return res
      .status(400)
      .json({ error: "Description is not allowed for this task type" });
  }

  // Check for Special Load validation
  if (
    type === "Special Load" &&
    (!dimensions || !weight || !specialinstructions)
  ) {
    return res.status(400).json({
      error:
        "Special Load requires dimensions, weight, and special instructions.",
    });
  }

  // If type is not "Special Load" but dimensions, weight, or special instructions are provided → Return an error and do not save.
  if (
    type !== "Special Load" &&
    (dimensions || weight || specialinstructions)
  ) {
    return res.status(400).json({
      error:
        "Dimensions, weight, and special instructions are not allowed for this task type",
    });
  }

  // ถ้าไม่มี tasknumber ซ้ำ ให้เพิ่มข้อมูลใหม่
  const { data, error } = await supabase
    .from("stock_tasks")
    .insert([
      {
        tasknumber,
        createdby,
        assignedto,
        product,
        type,
        status: "Created",
        description,
        dimensions,
        weight,
        specialinstructions,
        startedat: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({
    message: "Stock task created successfully!",
    data,
  });
};

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_status:
 *                 type: string
 *                 enum: [Created, In Progress, Done, Cancelled by Requester]
 *               description:
 *                 type: string
 *               dimensions:
 *                 type: string
 *               weight:
 *                 type: string
 *               specialinstructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */

// อัปเดต Stock Task ตาม Task Number (ตรวจสอบว่ามี tasknumber หรือไม่)
const updateStockTask = async (req, res) => {
  const { taskNumber } = req.params;
  const {
    new_status: newStatus,
    description,
    dimensions,
    weight,
    specialinstructions,
  } = req.body;

  // Get existing task data
  const { data: task, error: taskError } = await supabase
    .from("stock_tasks")
    .select("*")
    .eq("tasknumber", taskNumber)
    .maybeSingle();
  if (taskError) {
    return res.status(500).json({ error: taskError.message });
  }
  if (!task) {
    return res.status(404).json({ message: "Stock Task not found" });
  }

  // Check if the status is valid
  if (newStatus == "Cancelled by Requester" && task.type !== "Regular Load") {
    return res.status(400).json({
      error: "Only Regular Load can be cancelled by Requester",
    });
  }

  // Check if the task type is "Urgent Load" and ensure a description is provided
  if (task.type === "Urgent Load" && !description && !task.description) {
    return res.status(400).json({
      error: "Description must be provided for Urgent Load tasks",
    });
  }

  if (task.type !== "Urgent Load" && description && !task.description) {
    return res.status(400).json({
      error: "Description is not allowed for this task type",
    });
  }

  // Check for Special Load validation
  if (
    task.type === "Special Load" &&
    !dimensions &&
    !weight &&
    !specialinstructions
  ) {
    return res.status(400).json({
      error:
        "Special Load requires dimensions, weight, and special instructions.",
    });
  }
  // If type is not "Special Load" but dimensions, weight, or special instructions are provided → Return an error and do not save.
  if (
    task.type !== "Special Load" &&
    (dimensions || weight || specialinstructions)
  ) {
    return res.status(400).json({
      error:
        "Dimensions, weight, and special instructions are not allowed for this task type",
    });
  }

  // Update fields based on the new status and task type"
  const updateFields = {
    status: newStatus,
    ...(newStatus === "Done" &&
      !task.finishedat && { finishedat: new Date().toISOString() }),
    ...(task.type === "Urgent Load" && description && { description }),
    ...(task.type === "Special Load" && dimensions && { dimensions }),
    ...(task.type === "Special Load" && weight && { weight }),
    ...(task.type === "Special Load" &&
      specialinstructions && { specialinstructions }),
  };

  // ทำการอัปเดตข้อมูล
  const { data, error } = await supabase
    .from("stock_tasks")
    .update(updateFields)
    .eq("tasknumber", taskNumber)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: "Stock Task updated successfully!",
    data,
  });
};

module.exports = {
  getStockTasks,
  createStockTask,
  updateStockTask,
};
