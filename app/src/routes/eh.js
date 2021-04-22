var express = require('express');
var service = require('../service/EHService');

var router = express.Router();

router.post('/login', async function (req, res, next) {
  let data = await service.login(req.body.account, req.body.password, req.body.proxy);
  res.send(data);
});

router.post('/init', async function (req, res, next) {
  let data = await service.init(req.body.url, req.body.cookie, req.body.proxy);
  res.send(data);
});

router.post('/download', async function (req, res, next) {
  let data = await service.download(req.body.path, req.body.item, req.body.prefix, req.body.medium, req.body.cookie, req.body.proxy);
  res.send(data);
});

module.exports = router;