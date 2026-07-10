const mongoose = require('mongoose');

function dbBagli() {
  return mongoose.connection.readyState === 1;
}

/** MONGO_URI var ama bağlantı henüz hazır değil */
function mongoBekleniyor() {
  return Boolean(process.env.MONGO_URI) && mongoose.connection.readyState !== 1;
}

module.exports = { dbBagli, mongoBekleniyor };
