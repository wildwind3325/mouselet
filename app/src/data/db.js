var Sequelize = require('sequelize');
var conn = require('./conn');

/** 数据库操作帮助类 */
class DB {
  /**
   * 构建新的数据库连接实例
   */
  constructor() {
  }

  /**
   * 开启一个非托管事务
   */
  beginTransaction() {
    return new Promise((resolve, reject) => {
      conn.transaction().then(t => {
        this.transaction = t;
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
  }

  /**
   * 提交当前事务
   */
  commit() {
    if (this.transaction !== null) {
      return this.transaction.commit();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * 回滚当前事务
   */
  rollback() {
    if (this.transaction !== null) {
      return this.transaction.rollback();
    } else {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  /**
   * 执行数据库查询，内部方法。
   * @param {string} sql 查询语句
   * @param {any} options 配置数据
   */
  async execute(sql, options) {
    options = options || {};
    if (this.transaction !== null) {
      options.transaction = this.transaction;
    }
    let result = await conn.query(sql, options)
    return result;
  }

  /**
   * 执行数据库更新操作
   * @param {string} sql 查询语句
   * @param {any} params 参数
   */
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

  /**
   * 执行实体插入操作
   * @param {string} table 数据表名
   * @param {any} obj 实体对象
   */
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

  /**
   * 执行实体更新操作
   * @param {string} table 数据表名
   * @param {any} obj 实体对象
   */
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

  /**
   * 执行实体物理删除操作
   * @param {string} table 数据表名
   * @param {any} obj 实体对象
   */
  async delete(table, obj) {
    let sql = 'DELETE FROM `' + table + '` WHERE `id` = :id';
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.UPDATE,
      replacements: { id: obj['id'] }
    });
    return result[1];
  }

  /**
   * 根据自增主键查询实体
   * @param {string} table 数据表名
   * @param {number} id 自增主键
   * @param {boolean} lock 是否锁定行
   */
  async findById(table, id, lock) {
    let sql = 'SELECT * FROM `' + table + '` WHERE `id` = :id';
    if (lock && this.transaction) {
      sql += ' FOR UPDATE';
    }
    let rows = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { id: id }
    });
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  }

  /**
   * 执行一般查询操作
   * @param {string} sql 查询语句
   * @param {any} params 参数
   */
  async find(sql, params) {
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: params
    });
    return result;
  }

  /**
   * 执行单表查询操作
   * @param {string} table 数据表名
   * @param {Array} fields 查询列
   * @param {string} where 查询条件
   * @param {string} orderBy 排序
   * @param {any} params 参数
   */
  async findByTable(table, fields, where, orderBy, params) {
    let all = this.buildFields(fields);
    let sql = 'SELECT ' + all + ' FROM `' + table + '` ' + where + orderBy;
    let result = await this.execute(sql, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: params
    });
    return result;
  }

  /**
   * 执行分页查询操作
   * @param {any} options 配置数据
   */
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

  /**
   * 将字段列表转换为选择内容
   * @param {Array} fields 字段列表
   */
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