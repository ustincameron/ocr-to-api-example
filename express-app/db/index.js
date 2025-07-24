const { Sequelize } = require('sequelize');
const settings = require('../config');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('sqlite::memory:', {
    dialect: 'sqlite',
    logging: false,
  });
} else {
  sequelize = new Sequelize(settings.databaseUrl, {
    dialect: 'postgres',
    logging: settings.logging,
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Order = require('./models/order')(sequelize, Sequelize);
db.UserLog = require('./models/user_log')(sequelize, Sequelize);

module.exports = db;
