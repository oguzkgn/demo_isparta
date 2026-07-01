const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-isparta-gizli-anahtar';

function tokenOlustur(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function authZorunlu(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ mesaj: 'Giriş yapmanız gerekiyor.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    const user = await User.findById(decoded.id).select('-sifre');
    if (!user) return res.status(401).json({ mesaj: 'Oturum geçersiz.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ mesaj: 'Oturum süresi dolmuş.' });
  }
}

module.exports = { authZorunlu, tokenOlustur, JWT_SECRET };
