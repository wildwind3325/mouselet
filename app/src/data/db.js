var Sequelize = require('sequelize');
var cm = require('./cm');

class DB {
  constructor(name) {
    this.conn = cm.get(name);
  }

  beginTransaction() {
    return new Promise((resolve, reject) => {
      this.conn.transaction().then(t => {
        this.transaction = t;
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  commit() {
    if (this.transaction !== null) {
      return this.transaction.commit();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  rollback() {
    if (this.transaction !== null) {
      return this.transaction.rollback();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  async execute(sql, options) {
    options = options || {};
    if (this.transaction !== null) {
      options.transaction = this.transaction;
    }
    let result = await this.conn.query(sql, options)
    return result;
  }

  executeUpdate(sql, params) {
    return new Promise((resolve, reject) => {
      this.execute(sql, {
        type: Sequelize.QueryTypes.UPDATE,
        replacements: params
      }).then(result => {
        resolve(result[1]);
      }).catch(error => {
        reject(error);
      });
    });
  }

  async insert(table, obj) {
    let sql = 'INSERT INTO `' + table + '` (';
    let values = ' VALUES (';
    for (let prop in obj) {
      if (prop !== 'id') {
        sql += '`' + prop + '`, ';
        values += ':' + prop + ', ';
      }
    }
    sql = sql.substring(0, sql.length - 2);
    values = values.substring(0, values.length - 2);
    sql += ')' + values + ')';
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.INSERT,
      replacements: obj
    });
    obj['id'] = result[0];
    return result;
  }

  async update(table, obj) {
    let sql = 'UPDATE `' + table + '` SET ';
    for (let prop in obj) {
      if (prop !== 'id') {
        sql += '`' + prop + '` = :' + prop + ', ';
      }
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' WHERE `id` = :id';
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.UPDATE,
      replacements: obj
    });
    return result[1];
  }

  async delete(table, obj) {
    let sql = 'DELETE FROM `' + table + '` WHERE `id` = :id';
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.UPDATE,
      replacements: { id: obj['id'] }
    });
    return result[1];
  }

  async findById(table, id) {
    let sql = 'SELECT * FROM `' + table + '` WHERE `id` = :id';
    let rows = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { id: id }
    });
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  }

  async find(sql, params) {
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: params
    });
    return result;
  }

  async findByTable(table, fields, where, orderBy, params) {
    let all = this.buildFields(fields);
    let sql = 'SELECT ' + all + ' FROM `' + table + '` ' + where + orderBy;
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: params
    });
    return result;
  }

  async findByPage(options) {
    let sql = 'SELECT COUNT(*) AS `total` FROM `' + options.table + '` ' + options.where;
    let result = await this.find(sql, options.params);
    let total = parseInt(result[0].total);
    let pageSize = options.pageSize, pageNumber = options.pageNumber;
    if (total <= pageSize * (pageNumber - 1)) {
      pageNumber = Math.max(Math.ceil(total / pageSize), 1);
    }
    let from = pageSize * (pageNumber - 1);
    let orderBy = options.orderBy || 'ORDER BY `id` ASC';
    let where = options.where || '';
    let all = this.buildFields(options.fields);
    sql = 'SELECT ' + all + ' FROM `' + options.table + '` ' + where + ' ' + orderBy + ' LIMIT ' + from + ', ' + pageSize;
    result = await this.find(sql, options.params);
    return {
      total: total,
      pageSize: pageSize,
      pageNumber: pageNumber,
      rows: result
    };
  }

  buildFields(fields) {
    if (!fields || fields.length === 0) {
      return '*';
    }
    let all = '`' + fields[0] + '`';
    for (let i = 1; i < fields.length; i++) {
      all += ', ' + '`' + fields[i] + '`';
    }
    return all;
  }
}

module.exports = DB;