const ReviewModel = require("../models/reviewModel");

exports.getTopReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.getTop3();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.getAll();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
};

exports.createReview = async (req, res) => {
  try {
    const { rating, content } = req.body;
    await ReviewModel.create(req.user.id, rating, content);
    res.status(201).json("Đánh giá thành công!");
  } catch (err) {
    res.status(500).json("Lỗi server: " + err.message);
  }
};