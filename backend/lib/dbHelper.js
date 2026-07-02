const mongoose = require('mongoose');

function dbBagli() {
  return mongoose.connection.readyState === 1;
}

module.exports = { dbBagli };
