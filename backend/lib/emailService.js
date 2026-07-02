const nodemailer = require('nodemailer');

let transporter;

function smtpYapilandirildiMi() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporterAl() {
  if (transporter) return transporter;
  if (!smtpYapilandirildiMi()) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

function uygulamaUrl() {
  return process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
}

async function epostaGonder({ to, konu, metin, html }) {
  const transport = transporterAl();
  if (!transport) {
    const hata = new Error('E-posta servisi yapılandırılmamış (SMTP).');
    hata.kod = 'SMTP_YOK';
    throw hata;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: konu,
    text: metin,
    html: html || metin.replace(/\n/g, '<br>')
  });
  return { gonderildi: true };
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
    'Bu isteği siz yapmadıysanız e-postayı yok sayın.'
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

module.exports = { epostaGonder, dogrulamaMailiGonder, smtpYapilandirildiMi, uygulamaUrl };
