// File: backend/models/productModel.js
const db = require('../db');

const ProductModel = {
    // Lấy danh sách (Có phân trang & Lọc)
    getAll: async (limit, offset, categoryId) => {
        let sql = `
            SELECT SP.*, HA.duong_dan_anh, KHO.so_luong 
            FROM SAN_PHAM SP
            LEFT JOIN HINH_ANH_SAN_PHAM HA ON SP.ma_san_pham = HA.ma_san_pham AND HA.anh_chinh = 1
            LEFT JOIN KHO ON SP.ma_san_pham = KHO.ma_san_pham
            WHERE SP.trang_thai = 1
        `;
        const params = [];

        if (categoryId) {
            sql += " AND SP.ma_danh_muc = ?";
            params.push(categoryId);
        }

        sql += " ORDER BY SP.ngay_tao DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    },

    //  Đếm tổng (Hỗ trợ phân trang)
    countTotal: async () => {
        const [rows] = await db.query("SELECT COUNT(*) as total FROM SAN_PHAM WHERE trang_thai = 1");
        return rows[0].total;
    },

    //  Lấy chi tiết sản phẩm + Ảnh + Kho
    getById: async (id) => {
        // Lấy thông tin cơ bản
        const [product] = await db.query(`
            SELECT SP.*, DM.ten_danh_muc, KHO.so_luong
            FROM SAN_PHAM SP
            JOIN DANH_MUC DM ON SP.ma_danh_muc = DM.ma_danh_muc
            LEFT JOIN KHO ON SP.ma_san_pham = KHO.ma_san_pham
            WHERE SP.ma_san_pham = ?
        `, [id]);

        if (product.length === 0) return null;

        // Lấy album ảnh
        const [images] = await db.query("SELECT * FROM HINH_ANH_SAN_PHAM WHERE ma_san_pham = ?", [id]);

        return { ...product[0], images };
    },

    // Tạo sản phẩm (Dùng Transaction để đảm bảo an toàn)
    createFull: async (data, files) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction(); // Bắt đầu giao dịch

            //  Thêm SP
            const [resSP] = await conn.query(`
                INSERT INTO SAN_PHAM (ten_san_pham, ma_danh_muc, mo_ta, gia)
                VALUES (?, ?, ?, ?)
            `, [data.ten_san_pham, data.ma_danh_muc, data.mo_ta, data.gia]);
            
            const newId = resSP.insertId;

            //  Thêm Kho
            await conn.query("INSERT INTO KHO (ma_san_pham, so_luong) VALUES (?, ?)", [newId, data.so_luong || 0]);

            //  Thêm Ảnh (Nếu có)
            if (files && files.length > 0) {
                const imgValues = files.map((file, idx) => [
                    newId, `/uploads/${file.filename}`, idx === 0 ? 1 : 0
                ]);
                await conn.query("INSERT INTO HINH_ANH_SAN_PHAM (ma_san_pham, duong_dan_anh, anh_chinh) VALUES ?", [imgValues]);
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
    update: async (id, data) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            await conn.query(`
                UPDATE SAN_PHAM SET ten_san_pham=?, ma_danh_muc=?, mo_ta=?, gia=?, trang_thai=?
                WHERE ma_san_pham=?
            `, [data.ten_san_pham, data.ma_danh_muc, data.mo_ta, data.gia, data.trang_thai, id]);

            if (data.so_luong !== undefined) {
                await conn.query("UPDATE KHO SET so_luong = ? WHERE ma_san_pham = ?", [data.so_luong, id]);
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

    // 6. Xóa mềm
    softDelete: async (id) => {
        return await db.query("UPDATE SAN_PHAM SET trang_thai = 0 WHERE ma_san_pham = ?", [id]);
    }
};

module.exports = ProductModel;