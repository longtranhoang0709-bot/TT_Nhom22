const db = require("../db");

// 1. Lấy danh sách tồn kho 
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        nl.ma_nguyen_lieu,
        nl.ten_nguyen_lieu,
        nl.don_vi_tinh,
        k.so_luong,
        k.nha_cung_cap,
        k.dinh_muc_toi_thieu,
        k.dinh_muc_toi_da,
        k.ngay_nhap_cuoi
      FROM KHO k
      JOIN NGUYEN_LIEU nl ON k.ma_nguyen_lieu = nl.ma_nguyen_lieu
      ORDER BY k.so_luong ASC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json("Lỗi lấy dữ liệu kho: " + err.message);
  }
};

// 2. Nhập kho 
exports.restock = async (req, res) => {
    try {
        const { id } = req.params; 
        const { amount } = req.body; 
        
        await db.query(
            "UPDATE KHO SET so_luong = so_luong + ?, ngay_nhap_cuoi = CURDATE() WHERE ma_nguyen_lieu = ?",
            [amount, id]
        );
        res.status(200).json("Nhập hàng thành công");
    } catch (err) {
        res.status(500).json("Lỗi nhập hàng: " + err.message);
    }
};

// 3. Lấy danh sách nguyên liệu
exports.getAllIngredients = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM NGUYEN_LIEU");
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json("Lỗi lấy nguyên liệu");
    }
};
//4. Thêm nguyên liệu mới 
exports.addIngredient = async (req, res) => {
    try {
        const { ten_nguyen_lieu, don_vi_tinh, nha_cung_cap, so_luong, dinh_muc_toi_thieu, dinh_muc_toi_da } = req.body;
        const [result] = await db.query(
            "INSERT INTO NGUYEN_LIEU (ten_nguyen_lieu, don_vi_tinh) VALUES (?, ?)",
            [ten_nguyen_lieu, don_vi_tinh]
        );
        const newId = result.insertId; 
        await db.query(
            `INSERT INTO KHO (ma_nguyen_lieu, so_luong, nha_cung_cap, dinh_muc_toi_thieu, dinh_muc_toi_da, ngay_nhap_cuoi) 
             VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [newId, so_luong || 0, nha_cung_cap, dinh_muc_toi_thieu || 10, dinh_muc_toi_da || 1000]
        );

        res.status(200).json({ message: "Thêm nguyên liệu thành công", id: newId });
    } catch (err) {
        console.error(err);
        res.status(500).json("Lỗi thêm nguyên liệu: " + err.message);
    }
};