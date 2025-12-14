const db = require("../db");
const ProductModel = {
  
  // Lấy tất cả sản phẩm 
  getAll: async (limit, offset, categoryId, keyword, viewAll = false) => {
    let sql = `
            SELECT SP.*, HA.duong_dan_anh, KHO.so_luong 
            FROM SAN_PHAM SP
            LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
            LEFT JOIN KHO ON SP.ma_san_pham = KHO.ma_san_pham
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

  //  Đếm tổng 
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

  //  Lấy chi tiết sản phẩm + Ảnh + Kho
  getById: async (id) => {
    // Lấy thông tin cơ bản
    const [product] = await db.query(
      `
            SELECT SP.*, DM.ten_danh_muc, KHO.so_luong
            FROM SAN_PHAM SP
            JOIN DANH_MUC DM ON SP.ma_danh_muc = DM.ma_danh_muc
            LEFT JOIN KHO ON SP.ma_san_pham = KHO.ma_san_pham
            WHERE SP.ma_san_pham = ?
        `,
      [id]
    );

    // Nếu không tìm thấy
    if (product.length === 0) return null;
    // Lấy album ảnh
    const [images] = await db.query(
      "SELECT * FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?",
      [id]
    );

    return { ...product[0], images };
  },

  // Tạo sản phẩm (Dùng Transaction để đảm bảo an toàn)
  createFull: async (data, files) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction(); // Bắt đầu giao dịch

      //  Thêm SP
      const [resSP] = await conn.query(
        `
                INSERT INTO SAN_PHAM (ten_san_pham, ma_danh_muc, mo_ta, gia)
                VALUES (?, ?, ?, ?)
            `,
        [data.ten_san_pham, data.ma_danh_muc, data.mo_ta, data.gia]
      );

      const newId = resSP.insertId;

      //  Thêm Kho
      await conn.query(
        "INSERT INTO KHO (ma_san_pham, so_luong) VALUES (?, ?)",
        [newId, data.so_luong || 0]
      );

      //  Thêm Ảnh (Nếu có)
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

      await conn.commit(); // Lưu thành công
      return newId;
    } catch (err) {
      await conn.rollback(); // Hoàn tác nếu lỗi
      throw err;
    } finally {
      conn.release();
    }
  },

  // Cập nhật
  update: async (id, data, files) => {
    // Thêm tham số files
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Cập nhật thông tin văn bản 
      const fields = [];
      const values = [];

      if (data.ten_san_pham) {
        fields.push("ten_san_pham = ?");
        values.push(data.ten_san_pham);
      }
      if (data.ma_danh_muc) {
        fields.push("ma_danh_muc = ?");
        values.push(data.ma_danh_muc);
      }
      if (data.mo_ta) {
        fields.push("mo_ta = ?");
        values.push(data.mo_ta);
      }
      if (data.gia) {
        fields.push("gia = ?");
        values.push(data.gia);
      }
      if (data.trang_thai) {
        fields.push("trang_thai = ?");
        values.push(data.trang_thai);
      }

      if (fields.length > 0) {
        values.push(id);
        const sql = `UPDATE SAN_PHAM SET ${fields.join(
          ", "
        )} WHERE ma_san_pham = ?`;
        await conn.query(sql, values);
      }

      // Cập nhật kho
      if (data.so_luong !== undefined) {
        await conn.query("UPDATE KHO SET so_luong = ? WHERE ma_san_pham = ?", [
          data.so_luong,
          id,
        ]);
      }

      // 2. LOGIC: Xử lý cập nhật ảnh
      if (files && files.length > 0) {
        await conn.query(
          "DELETE FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?",
          [id]
        );

        
        const imgValues = files.map((file, idx) => [
          id,
          `/uploads/${file.filename}`,
          idx === 0 ? 1 : 0, // Ảnh đầu tiên là ảnh chính
        ]);
        await conn.query(
          "INSERT INTO HINH_ANH_SAN_PHAM (ma_san_pham, duong_dan_anh, anh_chinh) VALUES ?",
          [imgValues]
        );
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

  // 6. Xóa sản phẩm
  delete: async (id) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM KHO WHERE ma_san_pham = ?", [id]);
      await conn.query("DELETE FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?", [
        id,
      ]);

      // 3. Xóa sản phẩm khuyến mãi 
      await conn.query(
        "DELETE FROM SAN_PHAM_KHUYEN_MAI WHERE ma_san_pham = ?",
        [id]
      );

      // 4. Cuối cùng xóa sản phẩm
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
