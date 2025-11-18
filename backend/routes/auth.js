const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length > 0)
      return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hashed, email]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});
