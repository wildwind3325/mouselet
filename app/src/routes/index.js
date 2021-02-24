var common = require('./common');
var explorer = require('./explorer');

var router = app => {
  app.use('/api/common', common);
  app.use('/api/explorer', explorer);
};

module.exports = router;