const app = require('./app');
const logger = require('./config/logger');
const config = require('./config');

app.listen(config.port, () => {
  logger.info(`Express app listening at http://localhost:${config.port}`);
});
