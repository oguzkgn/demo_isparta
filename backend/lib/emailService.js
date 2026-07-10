const nodemailer = require('nodemailer');

let transporter = null;

function smtpKimlik() {
  return {
    user: String(process.env.SMTP_USER || '').trim(),
    pass: String(process.env.SMTP_PASS || '').trim().replace(/\s+/g, '')
  };
}

function smtpYapilandirildiMi() {
  const { user, pass } = smtpKimlik();
  return Boolean(user && pass);
}

function fromAdresi() {
  const ham = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
  const acik = ham.match(/<([^>]+@[^>]+)>/);
  const duz = ham.match(/([^\s<>"']+@[^\s<>"']+)/);
  const eposta = (acik?.[1] || duz?.[1] || ham.replace(/^<|>$/g, '')).trim();
  if (eposta.includes('@')) return `demo Isparta <${eposta}>`;
  return ham || smtpKimlik().user;
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

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: smtpKimlik()
  });

  console.log('[Demo] SMTP: Gmail servisi hazır (', smtpKimlik().user, ')');
  return transporter;
}

/**
 * Temel e-posta gönderimi — try/catch + await sendMail
 */
async function epostaGonder({ to, konu, metin, html }) {
  try {
    const transport = transporterAl();
    if (!transport) {
      const hata = new Error('E-posta servisi yapılandırılmamış (SMTP_USER / SMTP_PASS).');
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

    console.log(`[Demo] E-posta gönderildi: ${to} (messageId: ${sonuc.messageId || '—'})`);
    return { gonderildi: true, messageId: sonuc.messageId };
  } catch (error) {
    transporterSifirla();
    console.error('❌ Mail Gönderim Hatası:', error);
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
      'Bu isteği siz yapmadıysanız e-postayı yok sayın.',
      '',
      'Gönderen: demo Isparta (godswhip540@gmail.com)'
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
    console.error('❌ Mail Gönderim Hatası:', error);
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
      'Bu isteği siz yapmadıysanız e-postayı yok sayın.',
      '',
      'Gönderen: demo Isparta (godswhip540@gmail.com)'
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
    console.error('❌ Mail Gönderim Hatası:', error);
    throw error;
  }
}

/** HTTP yanıtını bekletmeden arka planda gönder */
function mailArkaPlanGonder(gonderFn, kullanici) {
  if (!kullanici?.email) return;
  setImmediate(() => {
    gonderFn(kullanici).catch((error) => {
      console.error('❌ Mail Gönderim Hatası:', error);
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
