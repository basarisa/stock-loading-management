const express = require("express");
const cors = require("cors");
const stockTasksRoutes = require("./routes/stockTasksRoutes");
const { swaggerDocs, swaggerUi } = require("./config/swaggerConfig"); // นำเข้า Swagger

require("dotenv").config(); // โหลดค่าจากไฟล์ .env

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// ตั้งค่า Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api", stockTasksRoutes);

// Route ทดสอบ API
app.get("/", (req, res) => {
  res.send("Server running");
});

// เริ่มต้น Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
