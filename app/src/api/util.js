var crypto = require('crypto');

var util = {
  md5(str, code) {
    let md5 = crypto.createHash('md5');
    code = code || 'hex';
    return md5.update(str).digest(code);
  },
  sha1(str, code) {
    let sha1 = crypto.createHash('sha1');
    code = code || 'hex';
    return sha1.update(str).digest(code);
  }
};

module.exports = util;