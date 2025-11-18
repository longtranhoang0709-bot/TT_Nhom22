const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "brewhaven_db",
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối Database:", err);
    return;
  }
  console.log("Đã kết nối thành công đến MySQL Database.");
});

module.exports = db;