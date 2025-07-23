module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
    },
    document_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
  });

  return Order;
};