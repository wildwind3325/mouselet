var common = require('./common');
var explorer = require('./explorer');
var eh = require('./eh');

var router = app => {
  app.use('/api/common', common);
  app.use('/api/explorer', explorer);
  app.use('/api/eh', eh);
};

module.exports = router;