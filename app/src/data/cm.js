var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');

class CM {
  constructor() {
    this.conns = {};
    this.init('default');
  }

  async init(name) {
    if (!this.conns[name]) {
      let file;
      if (process.pkg) {
        file = path.join(process.cwd(), './data/' + name + '.db');
      } else {
        file = path.join(__dirname, '../../data/' + name + '.db');
      }
      this.conns[name] = new Sequelize({
        dialect: 'sqlite',
        storage: file,
        logging: false
      });
    }
  }

  get(name) {
    return this.conns[name || 'default'];
  }
}

module.exports = new CM();