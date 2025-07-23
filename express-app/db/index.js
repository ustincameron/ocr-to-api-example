const { Sequelize } = require('sequelize');
const settings = require('../config/settings');

const sequelize = new Sequelize(settings.databaseUrl, {
  dialect: 'postgres',
  logging: settings.logging,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Order = require('./models/order')(sequelize, Sequelize);
db.UserLog = require('./models/user_log')(sequelize, Sequelize);

// Sync all models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully.');
  })
  .catch(err => {
    console.error('Error synchronizing database:', err);
  });

module.exports = db;
