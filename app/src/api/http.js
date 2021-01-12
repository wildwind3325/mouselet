var request = require('request');

const worker = request.defaults({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:78.0) Gecko/20100101 Firefox/78.0'
  }
});

var http = {
  get(url, options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      worker({
        method: options.method || 'GET',
        url: url,
        headers: options.headers || {},
        proxy: options.proxy || '',
        timeout: (options.timeout || 10) * 1000,
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  },
  post(url, form, options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      worker({
        method: options.method || 'POST',
        url: url,
        form: form,
        headers: options.headers || {},
        proxy: options.proxy || '',
        timeout: (options.timeout || 10) * 1000,
        followRedirect: false,
        rejectUnauthorized: false
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
};

module.exports = http;