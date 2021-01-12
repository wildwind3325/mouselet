var path = require('path');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('sqlite:nodehp.db', {
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/windtalk.db'),
  logging: false,
  define: {
    freezeTableName: true,
    charset: 'utf8',
    timestamps: false
  }
});

module.exports = sequelize;