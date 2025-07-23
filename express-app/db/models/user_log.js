// express-app/db/models/user_log.js
module.exports = (sequelize, DataTypes) => {
  const UserLog = sequelize.define('UserLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      indexed: true,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'user_logs',
  });

  return UserLog;
};