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
 *               startedat:
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
  const { new_status: newStatus } = req.body;

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

  // ตรวจสอบสถานะใหม่
  let updateFields = { status: newStatus };

  // ถ้าสถานะเป็น "Done" และ finishedat ยังไม่มีค่า ให้ตั้งค่า finishedat
  if (newStatus === "Done" && !task.finishedat) {
    updateFields.finishedat = new Date().toISOString();
  }

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
