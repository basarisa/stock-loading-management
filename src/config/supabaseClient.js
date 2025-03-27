const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ทดสอบการเชื่อมต่อ
async function testConnection() {
  const { data, error } = await supabase
    .from("stock_tasks")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Connection Failed:", error.message);
  } else {
    console.log("Connected to Supabase:", data);
  }
}

// เรียกใช้ฟังก์ชันทดสอบ
testConnection();

module.exports = supabase;
