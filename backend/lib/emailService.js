const nodemailer = require('nodemailer');

let transporter = null;

const SMTP_TIMEOUT_MS = 15000;

function smtpKimlik() {
  return {
    user: String(process.env.SMTP_USER || '').trim(),
    pass: String(process.env.SMTP_PASS || '').trim().replace(/\s+/g, '')
  };
}

function smtpYapilandirildiMi() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = String(process.env.SMTP_PORT || '').trim();
  const from = String(process.env.SMTP_FROM || '').trim();
  const { user, pass } = smtpKimlik();
  return Boolean(host && port && user && pass && from);
}

function fromAdresi() {
  return String(process.env.SMTP_FROM || '').trim();
}

function uygulamaUrl() {
  return process.env.APP_URL || process.env.FRONTEND_URL || 'https://demo-isparta.vercel.app';
}

function transporterSifirla() {
  transporter = null;
}

function transporterAl() {
  if (transporter) return transporter;
  if (!smtpYapilandirildiMi()) return null;

  const port = Number(process.env.SMTP_PORT);

  transporter = nodemailer.createTransport({
    host: String(process.env.SMTP_HOST).trim(),
    port,
    secure: true,
    family: 4, // Render IPv6 ENETUNREACH hatasini onlemek icin IPv4 zorunlu
    auth: smtpKimlik(),
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS
  });

  console.log(`[Demo] SMTP hazir: ${process.env.SMTP_HOST}:${port} secure=true from=${fromAdresi()}`);
  return transporter;
}

/**
 * Temel e-posta gönderimi — await sendMail + try/catch
 */
async function epostaGonder({ to, konu, metin, html }) {
  try {
    const transport = transporterAl();
    if (!transport) {
      const hata = new Error('SMTP yapılandırması eksik (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).');
      hata.kod = 'SMTP_YOK';
      throw hata;
    }

    const sonuc = await transport.sendMail({
      from: fromAdresi(),
      to,
      subject: konu,
      text: metin,
      html: html || metin.replace(/\n/g, '<br>')
    });

    if (!sonuc?.messageId && !sonuc?.accepted?.length) {
      throw new Error('sendMail tamamlandı ancak messageId alınamadı.');
    }

    console.log(`[Demo] E-posta gönderildi: ${to} (messageId: ${sonuc.messageId || '—'})`);
    return { gonderildi: true, messageId: sonuc.messageId };
  } catch (error) {
    transporterSifirla();
    console.error('MAIL GONDERIM HATASI:', error);
    throw error;
  }
}

async function dogrulamaMailiGonder(kullanici) {
  try {
    const kod = kullanici?.emailDogrulamaKodu;
    if (!kod) throw new Error('Doğrulama kodu üretilemedi.');

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

    return await epostaGonder({
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
  } catch (error) {
    console.error('MAIL GONDERIM HATASI:', error);
    throw error;
  }
}

async function sifreSifirlamaMailiGonder(kullanici) {
  try {
    const kod = kullanici?.emailDogrulamaKodu;
    if (!kod) throw new Error('Sıfırlama kodu üretilemedi.');

    const link = `${uygulamaUrl()}/sifremi-unuttum?email=${encodeURIComponent(kullanici.email)}&kodGonderildi=1`;
    const metin = [
      'Merhaba,',
      '',
      'demo Isparta hesabınız için şifre sıfırlama kodunuz:',
      kod,
      '',
      `Şifre sıfırlama sayfası: ${link}`,
      '',
      'Kod 15 dakika geçerlidir. Bu kodu kimseyle paylaşmayın.',
      'Bu isteği siz yapmadıysanız e-postayı yok sayın.'
    ].join('\n');

    return await epostaGonder({
      to: kullanici.email,
      konu: 'demo Isparta — Şifre Sıfırlama Kodu',
      metin,
      html: `
        <p>Merhaba,</p>
        <p>demo Isparta hesabınız için şifre sıfırlama kodunuz:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${kod}</p>
        <p><a href="${link}">Şifre sıfırlama sayfasına git</a></p>
        <p style="color:#666;font-size:13px">Kod 15 dakika geçerlidir. Bu kodu kimseyle paylaşmayın.</p>
      `
    });
  } catch (error) {
    console.error('MAIL GONDERIM HATASI:', error);
    throw error;
  }
}

/** HTTP yanıtını bekletmeden arka planda gönder (giriş vb.) */
function mailArkaPlanGonder(gonderFn, kullanici) {
  if (!kullanici?.email) return;
  setImmediate(() => {
    gonderFn(kullanici).catch((error) => {
      console.error('MAIL GONDERIM HATASI:', error);
    });
  });
}

function dogrulamaMailiArkaPlanGonder(kullanici) {
  mailArkaPlanGonder(dogrulamaMailiGonder, kullanici);
}

function sifreSifirlamaMailiArkaPlanGonder(kullanici) {
  mailArkaPlanGonder(sifreSifirlamaMailiGonder, kullanici);
}

module.exports = {
  epostaGonder,
  dogrulamaMailiGonder,
  sifreSifirlamaMailiGonder,
  dogrulamaMailiArkaPlanGonder,
  sifreSifirlamaMailiArkaPlanGonder,
  smtpYapilandirildiMi,
  uygulamaUrl,
  transporterSifirla
};
