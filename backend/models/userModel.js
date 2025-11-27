const db = require('../db');

const UserModel = {
    // 1. Lấy tất cả user (Có thể bỏ mat_khau ra cho bảo mật)
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT ma_nguoi_dung, ho_ten, email, so_dien_thoai, dia_chi, ngay_tao 
            FROM NGUOI_DUNG
        `);
        return rows;
    },

    // 2. Tìm theo ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?', [id]);
        return rows[0];
    },

    // 3. Tìm theo Email (Dùng cho cả Đăng ký & Đăng nhập)
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM NGUOI_DUNG WHERE email = ?', [email]);
        return rows[0];
    },

    // 4. Tạo User mới (Transaction: Tạo user + Gán quyền)
    create: async (conn, data) => {
        // Lưu ý: conn được truyền từ bên ngoài vào để đảm bảo Transaction
        const [result] = await conn.query(`
            INSERT INTO NGUOI_DUNG (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [data.ma_nguoi_dung, data.ho_ten, data.email, data.so_dien_thoai, data.mat_khau_ma_hoa, data.dia_chi]);
        
        return result;
    },

    // 5. Gán vai trò cho user
    assignRole: async (conn, userId, roleId) => {
        await conn.query(
            "INSERT INTO NGUOI_DUNG_VAI_TRO (ma_nguoi_dung, ma_vai_tro) VALUES (?, ?)",
            [userId, roleId]
        );
    },

    // 6. Cập nhật thông tin
    update: async (id, data) => {
        await db.query(`
            UPDATE NGUOI_DUNG 
            SET ho_ten = ?, so_dien_thoai = ?, dia_chi = ?
            WHERE ma_nguoi_dung = ?
        `, [data.ho_ten, data.so_dien_thoai, data.dia_chi, id]);
    },

    // 7. Xóa User
    delete: async (id) => {
        await db.query('DELETE FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?', [id]);
    }
};

module.exports = UserModel;