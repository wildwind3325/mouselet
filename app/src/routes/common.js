var express = require('express');
var DB = require('../data/db');

var router = express.Router();

router.post('/config/load', async function (req, res, next) {
  try {
    let db = new DB();
    let rows = await db.find('select * from [config]');
    let kvs = {};
    for (let i = 0; i < rows.length; i++) {
      kvs[rows[i].name] = rows[i].value;
    }
    res.send({
      success: true,
      data: kvs
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.post('/config/save', async function (req, res, next) {
  try {
    let db = new DB();
    await db.executeUpdate('update [config] set [value] = :value where [name] = :name', {
      name: req.body.name,
      value: req.body.value
    });
    res.send({ success: true });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;