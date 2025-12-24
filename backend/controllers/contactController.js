const ContactModel = require("../models/contactModel");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json("Vui lòng điền đầy đủ thông tin!");
    }
    await ContactModel.create({ name, email, message });
    res.status(201).json("Gửi tin nhắn thành công!");
  } catch (err) {
    res.status(500).json("Lỗi server: " + err.message);
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactModel.getAll();
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await ContactModel.delete(req.params.id);
    res.status(200).json("Đã xóa tin nhắn");
  } catch (err) {
    res.status(500).json("Lỗi xóa");
  }
};
