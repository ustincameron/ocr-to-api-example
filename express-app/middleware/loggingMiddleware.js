const { UserLog } = require('../db');
const logger = require('../config/logger');

const loggingMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', async () => {
    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2);

    const { method, originalUrl, ip } = req;
    const user_agent = req.headers['user-agent'];
    const { statusCode } = res;

    logger.info(
      `[${method}] ${originalUrl} - ${statusCode} [${duration}ms] - ${ip} - ${user_agent}`
    );

    try {
      await UserLog.create({
        method,
        path: originalUrl,
        status_code: statusCode,
        duration: parseFloat(duration),
        timestamp: new Date(),
        ip,
        user_agent,
      });
    } catch (error) {
      logger.error(`Error creating user log: ${error.message}`);
    }
  });

  next();
};

module.exports = loggingMiddleware;
