var explorer = require('./explorer');

var router = app => {
  app.use('/api/explorer', explorer);
};

module.exports = router;