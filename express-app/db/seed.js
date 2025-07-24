const { Order, UserLog } = require('./models');

const seedDatabase = async () => {
  try {
    // Sync all models
    await Order.sequelize.sync({ force: true });
    await UserLog.sequelize.sync({ force: true });

    // Create dummy orders
    await Order.bulkCreate([
      {
        customer_name: 'John Doe',
        total_price: 100.5,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        customer_name: 'Jane Smith',
        total_price: 250.75,
        status: 'shipped',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create dummy user logs
    await UserLog.bulkCreate([
      {
        username: 'admin',
        action: 'Logged in',
        timestamp: new Date(),
      },
      {
        username: 'guest',
        action: 'Viewed products',
        timestamp: new Date(),
      },
    ]);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await Order.sequelize.close();
    await UserLog.sequelize.close();
  }
};

seedDatabase();
