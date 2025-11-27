const ProductModel = require('../models/productModel'); 

exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const categoryId = req.query.category;

        // Gọi hàm từ Model
        const products = await ProductModel.getAll(limit, offset, categoryId);
        const total = await ProductModel.countTotal();

        res.status(200).json({
            data: products,
            pagination: { page, limit, total }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

exports.getProductById = async (req, res) => {
    try {
        // Gọi hàm từ Model
        const product = await ProductModel.getById(req.params.id);

        if (!product) return res.status(404).json("Không tìm thấy sản phẩm");
        
        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

exports.createProduct = async (req, res) => {
    try {
        // Gọi hàm createFull từ Model, truyền body và files vào
        const newProductId = await ProductModel.createFull(req.body, req.files);
        
        res.status(201).json({ 
            message: "Tạo sản phẩm thành công!", 
            productId: newProductId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi tạo sản phẩm", detail: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        await ProductModel.update(req.params.id, req.body);
        res.status(200).json("Cập nhật thành công!");
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi Server" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await ProductModel.softDelete(req.params.id);
        res.status(200).json("Đã xóa sản phẩm thành công!");
    } catch (err) {
        res.status(500).json({ error: "Lỗi Server" });
    }
};