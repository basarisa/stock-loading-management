const express = require("express");
const cors = require("cors");
const stockTasksRoutes = require("./routes/stockTasksRoutes");

require("dotenv").config(); // โหลดค่าจากไฟล์ .env

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", stockTasksRoutes);

// Route ทดสอบ API
app.get("/", (req, res) => {
  console.log("Got a call here /");
  res.send("Hello from Express.js Backend!");
});

// เริ่มต้น Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
