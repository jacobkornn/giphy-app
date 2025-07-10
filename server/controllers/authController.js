const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');

const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, userId: user.id });
}

async function register(req, res) {
  const { username, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashedPassword },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, userId: user.id });
}

module.exports = {
  login,
  register,
};




