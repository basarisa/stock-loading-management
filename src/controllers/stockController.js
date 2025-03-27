const supabase = require("../config/supabaseClient");

// ดึง Stock Tasks ทั้งหมด
const getStockTasks = async (req, res) => {
  const { data, error } = await supabase.from("stock_tasks").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// สร้าง Stock Task ใหม่
const createStockTask = async (req, res) => {
  const { tasknumber, createdby, assignedto, product, type, status } = req.body;
  const { data, error } = await supabase
    .from("stock_tasks")
    .insert([{ tasknumber, createdby, assignedto, product, type, status }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Stock task created successfully!", data });
};

// อัปเดต Stock Task ตาม Task Number
const updateStockTask = async (req, res) => {
  const { taskNumber } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase
    .from("stock_tasks")
    .update({ status })
    .eq("taskNumber", taskNumber);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = {
  getStockTasks,
  createStockTask,
  updateStockTask,
};
