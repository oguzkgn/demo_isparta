const nodemailer = require('nodemailer');

let transporter;

const SMTP_TIMEOUT_MS = 12000;

function smtpYapilandirildiMi() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    String(process.env.SMTP_PASS || '').trim()
  );
}

function smtpPort() {
  return Number(process.env.SMTP_PORT || 587);
}

function smtpSecure(port) {
  if (process.env.SMTP_SECURE === 'true') return true;
  if (process.env.SMTP_SECURE === 'false') return false;
  return port === 465;
}

function smtpKimlik() {
  return {
    user: String(process.env.SMTP_USER || '').trim(),
    pass: String(process.env.SMTP_PASS || '').trim().replace(/\s+/g, '')
  };
}

function fromAdresi() {
  const ham = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
  const acik = ham.match(/<([^>]+@[^>]+)>/);
  const duz = ham.match(/([^\s<>"']+@[^\s<>"']+)/);
  const eposta = (acik?.[1] || duz?.[1] || ham.replace(/^<|>$/g, '')).trim();
  if (eposta.includes('@')) return `demo Isparta <${eposta}>`;
  return ham || smtpKimlik().user;
}

function transporterSifirla() {
  transporter = null;
}

function transporterAl() {
  if (transporter) return transporter;
  if (!smtpYapilandirildiMi()) return null;

  const port = smtpPort();
  const secure = smtpSecure(port);

  transporter = nodemailer.createTransport({
    host: String(process.env.SMTP_HOST).trim(),
    port,
    secure,
    auth: smtpKimlik(),
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS
  });

  console.log(`[Demo] SMTP: ${process.env.SMTP_HOST}:${port} secure=${secure}`);
  return transporter;
}

function uygulamaUrl() {
  return process.env.APP_URL || process.env.FRONTEND_URL || 'https://demo-isparta.vercel.app';
}

async function epostaGonder({ to, konu, metin, html }) {
  const transport = transporterAl();
  if (!transport) {
    const hata = new Error('E-posta servisi yapılandırılmamış (SMTP).');
    hata.kod = 'SMTP_YOK';
    throw hata;
  }

  const zamanAsimi = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('SMTP zaman aşımı')), SMTP_TIMEOUT_MS);
  });

  try {
    await Promise.race([
      transport.sendMail({
        from: fromAdresi(),
        to,
        subject: konu,
        text: metin,
        html: html || metin.replace(/\n/g, '<br>')
      }),
      zamanAsimi
    ]);
    return { gonderildi: true };
  } catch (error) {
    transporterSifirla();
    console.error('[Demo] SMTP sendMail hatası:', error.message);
    throw error;
  }
}

async function dogrulamaMailiGonder(kullanici) {
  const kod = kullanici.emailDogrulamaKodu;
  if (!kod) {
    throw new Error('Doğrulama kodu üretilemedi.');
  }
  const link = `${uygulamaUrl()}/eposta-dogrula?email=${encodeURIComponent(kullanici.email)}`;
  const metin = [
    'Merhaba,',
    '',
    'demo Isparta hesabınız için e-posta doğrulama kodunuz:',
    kod,
    '',
    `Doğrulama sayfası: ${link}`,
    '',
    'Kod 15 dakika geçerlidir. Bu kodu kimseyle paylaşmayın.',
    'Bu isteği siz yapmadıysanız e-postayı yok sayın.',
    '',
    'Gönderen: demo Isparta (godswhip540@gmail.com)'
  ].join('\n');

  await epostaGonder({
    to: kullanici.email,
    konu: 'demo Isparta — E-posta Doğrulama Kodu',
    metin,
    html: `
      <p>Merhaba,</p>
      <p>demo Isparta hesabınız için doğrulama kodunuz:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${kod}</p>
      <p><a href="${link}">Doğrulama sayfasına git</a></p>
      <p style="color:#666;font-size:13px">Kod 15 dakika geçerlidir. Bu kodu kimseyle paylaşmayın.</p>
    `
  });
  console.log(`[Demo] Doğrulama e-postası gönderildi: ${kullanici.email}`);
  return { gonderildi: true };
}

/** HTTP yanıtını bekletmeden arka planda gönder */
function dogrulamaMailiArkaPlanGonder(kullanici) {
  if (!kullanici?.email) return;
  setImmediate(() => {
    dogrulamaMailiGonder(kullanici).catch((err) => {
      console.error('[Demo] Arka plan mail hatası:', err.message || err);
    });
  });
}

module.exports = {
  epostaGonder,
  dogrulamaMailiGonder,
  dogrulamaMailiArkaPlanGonder,
  smtpYapilandirildiMi,
  uygulamaUrl,
  transporterSifirla
};
