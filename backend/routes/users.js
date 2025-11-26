const express = require('express');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * GET: Lấy danh sách người dùng
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM NGUOI_DUNG');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * GET: Lấy người dùng theo ID
 */
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?',
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * POST: Tạo người dùng mới
 */
router.post('/', async (req, res) => {
  const { ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi } = req.body;

  if (!ho_ten || !email || !mat_khau_ma_hoa)
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });

  try {
    const userId = uuidv4();

    await db.query(
      `INSERT INTO NGUOI_DUNG
      (ma_nguoi_dung, ho_ten, email, so_dien_thoai, mat_khau_ma_hoa, dia_chi)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, ho_ten, email, so_dien_thoai || null, mat_khau_ma_hoa, dia_chi || null]
    );

    const [rows] = await db.query(
      'SELECT * FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?',
      [userId]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * PUT: Cập nhật người dùng
 */
router.put('/:id', async (req, res) => {
  const { ho_ten, email, so_dien_thoai, dia_chi } = req.body;

  try {
    await db.query(
      `UPDATE NGUOI_DUNG 
       SET ho_ten = ?, email = ?, so_dien_thoai = ?, dia_chi = ?
       WHERE ma_nguoi_dung = ?`,
      [ho_ten, email, so_dien_thoai, dia_chi, req.params.id]
    );

    const [rows] = await db.query(
      'SELECT * FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?',
      [req.params.id]
    );

    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * DELETE: Xóa người dùng
 */
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM NGUOI_DUNG WHERE ma_nguoi_dung = ?',
      [req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
