const supabase = require("../config/supabaseClient");

// ดึง Stock Tasks ทั้งหมด
const getStockTasks = async (req, res) => {
  const { data, error } = await supabase.from("stock_tasks").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

// สร้าง Stock Task ใหม่ (ตรวจสอบว่า tasknumber มีอยู่แล้วหรือไม่)
const createStockTask = async (req, res) => {
  const { tasknumber, createdby, assignedto, product, type, status } = req.body;

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
    .insert([{ tasknumber, createdby, assignedto, product, type, status }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({
    message: "Stock task created successfully!",
    data,
  });
};

// อัปเดต Stock Task ตาม Task Number (ตรวจสอบว่ามี tasknumber หรือไม่)
const updateStockTask = async (req, res) => {
  const { taskNumber } = req.params;
  const { status } = req.body;

  // ตรวจสอบว่ามี tasknumber นี้อยู่ในระบบหรือไม่
  const { data: existingTask, error: checkError } = await supabase
    .from("stock_tasks")
    .select("tasknumber")
    .eq("tasknumber", taskNumber)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ error: checkError.message });
  }

  if (!existingTask) {
    return res.status(404).json({ message: "Stock Task not found" });
  }

  // ทำการอัปเดตข้อมูล
  const { data, error } = await supabase
    .from("stock_tasks")
    .update({ status })
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
