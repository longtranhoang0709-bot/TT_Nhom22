const db = require("../db");

// 1. Lấy danh sách Banner
exports.getBanners = async (req, res) => {
  try {
    // Lấy danh sách banner, sắp xếp mới nhất lên đầu
    const [rows] = await db.query(
      "SELECT * FROM BANNER ORDER BY ngay_tao DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json("Lỗi lấy banner");
  }
};

// 2. Thêm Banner mới
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json("Vui lòng chọn ảnh!");

    // Lấy đường dẫn ảnh sau khi upload
    const imgUrl = `/uploads/${req.file.filename}`;

    // Lấy các tham số khác từ Body
    // ma_san_pham: Có thể null nếu banner không trỏ về sản phẩm nào
    // tien_ket: Có thể là tiêu đề hoặc đường dẫn
    const { ma_san_pham, tien_ket } = req.body;

    await db.query(
      "INSERT INTO BANNER (anh_url, ma_san_pham, tien_ket) VALUES (?, ?, ?)",
      [imgUrl, ma_san_pham || null, tien_ket || ""]
    );

    res.status(201).json("Đã thêm banner!");
  } catch (err) {
    console.error(err);
    res.status(500).json("Lỗi thêm banner: " + err.message);
  }
};

// 3. Xóa Banner
exports.deleteBanner = async (req, res) => {
  try {
    await db.query("DELETE FROM BANNER WHERE ma_banner = ?", [req.params.id]);
    res.status(200).json("Đã xóa banner!");
  } catch (err) {
    res.status(500).json("Lỗi xóa banner");
  }
};
