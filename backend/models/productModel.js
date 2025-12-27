const db = require("../db");

const ProductModel = {
  // 1. Lấy tất cả sản phẩm
  getAll: async (limit, offset, categoryId, keyword, viewAll = false) => {
    let sql = `
            SELECT SP.*, HA.duong_dan_anh 
            FROM SAN_PHAM SP
            LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
            WHERE 1=1 
        `;

    if (!viewAll) {
      sql += " AND SP.trang_thai = 1";
    }

    const params = [];

    if (categoryId) {
      sql += " AND SP.ma_danh_muc = ?";
      params.push(categoryId);
    }
    if (keyword) {
      sql += " AND SP.ten_san_pham LIKE ?";
      params.push(`%${keyword}%`);
    }
    sql += " ORDER BY SP.ngay_tao DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    return rows;
  },

  // 2. Đếm tổng
  countTotal: async (categoryId, keyword, viewAll = false) => {
    let sql = "SELECT COUNT(*) as total FROM SAN_PHAM WHERE 1=1";
    const params = [];

    if (!viewAll) sql += " AND trang_thai = 1";
    if (categoryId) {
      sql += " AND ma_danh_muc = ?";
      params.push(categoryId);
    }
    if (keyword) {
      sql += " AND ten_san_pham LIKE ?";
      params.push(`%${keyword}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows[0].total;
  },

  // 3. Lấy chi tiết
  getById: async (id) => {
    const [product] = await db.query(
      `
            SELECT SP.*, DM.ten_danh_muc
            FROM SAN_PHAM SP
            JOIN DANH_MUC DM ON SP.ma_danh_muc = DM.ma_danh_muc
            WHERE SP.ma_san_pham = ?
        `,
      [id]
    );

    if (product.length === 0) return null;
    const [images] = await db.query(
      "SELECT * FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?",
      [id]
    );
    const [recipe] = await db.query(
      `SELECT 
          CT.ma_nguyen_lieu as id, 
          CT.so_luong_can as amount,  
          NL.ten_nguyen_lieu, 
          NL.don_vi_tinh
       FROM CONG_THUC CT
       JOIN NGUYEN_LIEU NL ON CT.ma_nguyen_lieu = NL.ma_nguyen_lieu
       WHERE CT.ma_san_pham = ?`,
      [id]
    );
    return { ...product[0], images, recipe };
  },

  // 4. Tạo sản phẩm mới
  createFull: async (data, files) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Thêm SP
      const [resSP] = await conn.query(
        `INSERT INTO SAN_PHAM (ten_san_pham, ma_danh_muc, mo_ta, gia) VALUES (?, ?, ?, ?)`,
        [data.ten_san_pham, data.ma_danh_muc, data.mo_ta, data.gia]
      );
      const newId = resSP.insertId;
      // Thêm Ảnh
      if (files && files.length > 0) {
        const imgValues = files.map((file, idx) => [
          newId,
          `/uploads/${file.filename}`,
          idx === 0 ? 1 : 0,
        ]);
        await conn.query(
          "INSERT INTO HINH_ANH_SAN_PHAM (ma_san_pham, duong_dan_anh, anh_chinh) VALUES ?",
          [imgValues]
        );
      }

      await conn.commit();
      return newId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // 5. Cập nhật
  update: async (id, data, files, ingredients) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const fields = [];
      const values = [];

      if (data.ten_san_pham) { fields.push("ten_san_pham = ?"); values.push(data.ten_san_pham); }
      if (data.ma_danh_muc) { fields.push("ma_danh_muc = ?"); values.push(data.ma_danh_muc); }
      if (data.mo_ta) { fields.push("mo_ta = ?"); values.push(data.mo_ta); }
      if (data.gia) { fields.push("gia = ?"); values.push(data.gia); }
      if (data.trang_thai) { fields.push("trang_thai = ?"); values.push(data.trang_thai); }

      if (fields.length > 0) {
        values.push(id);
        await conn.query(`UPDATE SAN_PHAM SET ${fields.join(", ")} WHERE ma_san_pham = ?`, values);
      }

      // B. Update Ảnh 
      if (files && files.length > 0) {
        await conn.query("DELETE FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?", [id]);
        const imgValues = files.map((file, idx) => [
          id,
          `/uploads/${file.filename}`,
          idx === 0 ? 1 : 0,
        ]);
        await conn.query(
          "INSERT INTO HINH_ANH_SAN_PHAM (ma_san_pham, duong_dan_anh, anh_chinh) VALUES ?",
          [imgValues]
        );
      }

      // C. Update Công Thức 
      if (ingredients) {
        // 1. Xóa công thức cũ
        await conn.query("DELETE FROM CONG_THUC WHERE ma_san_pham = ?", [id]);
        // 2. Thêm công thức mới 
        if (ingredients.length > 0) {
            for (const ing of ingredients) {
                await conn.query(
                    "INSERT INTO CONG_THUC (ma_san_pham, ma_nguyen_lieu, so_luong_can) VALUES (?, ?, ?)",
                    [id, ing.id, ing.amount]
                );
            }
        }
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // 6. Xóa
  delete: async (id) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?", [
        id,
      ]);
      await conn.query(
        "DELETE FROM SAN_PHAM_KHUYEN_MAI WHERE ma_san_pham = ?",
        [id]
      );
      await conn.query("DELETE FROM CONG_THUC WHERE ma_san_pham = ?", [id]); // Xóa thêm công thức
      await conn.query("DELETE FROM SAN_PHAM WHERE ma_san_pham = ?", [id]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = ProductModel;
