// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Stock Tasks API",
      version: "1.0.0",
      description: "API for managing stock tasks in a warehouse system",
    },
    servers: [
      {
        url: "http://localhost:5001/api", // ระบุ URL ของ API 
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // ชี้ไปที่ไฟล์ route และ controller เพื่อให้ Swagger สร้างเอกสาร
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };
