const { UserLog } = require('../db'); // Corrected import path

const loggingMiddleware = (req, res, next) => {
  const start = process.hrtime(); // Start timer

  res.on('finish', async () => {
    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2); // Duration in ms

    const userLogData = {
      method: req.method,
      path: req.originalUrl, // Use originalUrl to include query parameters
      status_code: res.statusCode,
      duration: parseFloat(duration),
      timestamp: new Date(),
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    };

    try {
      await UserLog.create(userLogData);
    } catch (error) {
      console.error('Error creating user log:', error);
    }
  });

  next();
};

module.exports = loggingMiddleware;
