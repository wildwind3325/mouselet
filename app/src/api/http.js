var request = require('request');

const worker = request.defaults({
  rejectUnauthorized: false,
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
        proxy: options.proxy || ''
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
        followRedirect: false
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  },
  download(url, options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      worker({
        method: options.method || 'GET',
        url: url,
        headers: options.headers || {},
        proxy: options.proxy || '',
        encoding: null
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  },
  findCookie(cookies, name) {
    if (!cookies || cookies.length === 0) return '';
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].startsWith(name)) {
        return cookies[i].substring(cookies[i].indexOf('=') + 1, cookies[i].indexOf(';'));
      }
    }
    return '';
  }
};

module.exports = http;