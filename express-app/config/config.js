const settings = require('./settings');

module.exports = {
  development: {
    url: settings.databaseUrl,
    dialect: 'postgres',
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
  },
  production: {
    url: settings.databaseUrl,
    dialect: 'postgres',
  },
};
