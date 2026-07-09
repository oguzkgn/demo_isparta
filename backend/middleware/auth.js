const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { epostaDogrulandiMi } = require('../lib/emailDogrulama');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-isparta-gizli-anahtar';

function tokenOlustur(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function kullaniciYukle(decoded) {
  if (dbBagli() && !memoryStore.isMemoryUser(decoded.id)) {
    const user = await User.findById(decoded.id).select('-sifre -emailDogrulamaKodu -emailDogrulamaSon');
    if (user) return { user, memoryMode: false };
  }

  await memoryStore.ensureInit();
  const memUser = memoryStore.kullaniciGetir(decoded.id);
  if (memUser) return { user: memUser, memoryMode: true };

  return null;
}

/** Geçerli JWT — e-posta doğrulaması gerekmez (profil okuma, doğrulama sayfası) */
async function authZorunlu(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ mesaj: 'Giriş yapmanız gerekiyor.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    const kayit = await kullaniciYukle(decoded);
    if (!kayit) {
      return res.status(401).json({ mesaj: 'Oturum geçersiz.' });
    }
    req.user = kayit.user;
    req.memoryMode = kayit.memoryMode;
    return next();
  } catch {
    return res.status(401).json({ mesaj: 'Oturum süresi dolmuş.' });
  }
}

/** Sepet, sipariş vb. — e-posta doğrulanmış olmalı */
function epostaDogrulandiZorunlu(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ mesaj: 'Giriş yapmanız gerekiyor.' });
  }
  if (!epostaDogrulandiMi(req.user)) {
    return res.status(403).json({
      mesaj: 'E-posta doğrulanmadan bu işlem yapılamaz.',
      kod: 'EPOSTA_DOGRULANMADI',
      email: req.user.email
    });
  }
  return next();
}

function rolZorunlu(...roller) {
  return (req, res, next) => {
    if (!req.user || !roller.includes(req.user.rol)) {
      return res.status(403).json({ mesaj: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
}

module.exports = {
  authZorunlu,
  epostaDogrulandiZorunlu,
  rolZorunlu,
  tokenOlustur,
  JWT_SECRET
};
