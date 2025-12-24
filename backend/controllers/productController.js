const ProductModel = require("../models/productModel");

// Lấy danh sách sản phẩm với phân trang và lọc
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.category;
    const keyword = req.query.name;
    const viewAll = req.query.view_all === "true";

    const products = await ProductModel.getAll(
      limit,
      offset,
      categoryId,
      keyword,
      viewAll
    );

    const total = await ProductModel.countTotal(categoryId, keyword, viewAll);

    res.status(200).json({
      data: products,
      pagination: { page, limit, total },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await ProductModel.getById(req.params.id);

    if (!product) return res.status(404).json("Không tìm thấy sản phẩm");

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { name, description, price, categoryId, ingredients } = req.body;
    const imgUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const [resProd] = await conn.query(
      "INSERT INTO SAN_PHAM (ten_san_pham, mo_ta, gia, ma_danh_muc) VALUES (?, ?, ?, ?)",
      [name, description, price, categoryId]
    );
    const productId = resProd.insertId;
    if (imgUrl) {
      await conn.query(
        "INSERT INTO HINH_ANH_SAN_PHAM (ma_san_pham, duong_dan_anh, anh_chinh) VALUES (?, ?, 1)",
        [productId, imgUrl]
      );
    }
    // 3. Lưu Công Thức
    if (ingredients && ingredients.length > 0) {
      const ingList =
        typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;

      for (const ing of ingList) {
        await conn.query(
          "INSERT INTO CONG_THUC (ma_san_pham, ma_nguyen_lieu, so_luong_can) VALUES (?, ?, ?)",
          [productId, ing.id, ing.amount]
        );
      }
    }

    await conn.commit();
    res.status(201).json("Thêm món và công thức thành công!");
  } catch (err) {
    await conn.rollback();
    res.status(500).json("Lỗi: " + err.message);
  } finally {
    conn.release();
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    await ProductModel.update(req.params.id, req.body, req.files);

    res.status(200).json("Cập nhật thành công!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi Server" });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    await ProductModel.delete(req.params.id);
    res.status(200).json("Đã xóa vĩnh viễn sản phẩm!");
  } catch (err) {
    console.error("Lỗi xóa:", err);

    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(400)
        .json({ error: "Không thể xóa: Sản phẩm này đã có trong đơn hàng!" });
    }
    res.status(500).json({ error: "Lỗi Server: " + err.message });
  }
};
