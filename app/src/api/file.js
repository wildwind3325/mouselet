var mimes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp'
};

var file = {
  getExtension(name) {
    if (name.lastIndexOf('.') < 0) return false;
    return name.substr(name.lastIndexOf('.')).toLowerCase();
  },
  getImageMime(name) {
    let ext = this.getExtension(name);
    return mimes[ext];
  },
  getSizeString(size) {
    let range = 0;
    if (size > 0) {
      range = Math.min(4, Math.floor(Math.log10(size) / Math.log10(1024)));
    }
    let units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let temp = size;
    for (let i = 0; i < range; i++) {
      temp /= 1024;
    }
    let val = (Math.floor(temp * 100) / 100).toString();
    if (val.substr(val.length - 1) === '0') {
      val = val.substr(0, val.length - 1);
    }
    if (val.substr(val.length - 1) === '0') {
      val = val.substr(0, val.length - 1);
    }
    if (val.substr(val.length - 1) === '.') {
      val = val.substr(0, val.length - 1);
    }
    return val + ' ' + units[range];
  },
  genPath(route) {
    let seperator;
    if (process.platform.startsWith('win')) {
      seperator = '\\';
    } else {
      seperator = '/';
    }
    let dir = '';
    for (let i = 0; i < route.length; i++) {
      if (process.platform.startsWith('win') && i === 0) continue;
      dir += route[i] + seperator;
    }
    return dir;
  }
};

module.exports = file;