const crypto = require('crypto');

//lazy
module.exports = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");
