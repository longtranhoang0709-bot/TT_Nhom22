const ProductModel = require("../models/productModel");

// Lấy danh sách sản phẩm với phân trang và lọc
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.category;

    const viewAll = req.query.view_all === "true";

    const products = await ProductModel.getAll(
      limit,
      offset,
      categoryId,
      viewAll
    );

    const total = await ProductModel.countTotal();

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
  try {
    const newProductId = await ProductModel.createFull(req.body, req.files);

    res.status(201).json({
      message: "Tạo sản phẩm thành công!",
      productId: newProductId,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Lỗi khi tạo sản phẩm", detail: err.message });
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
