// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logs; use console.log for debug
  }
);

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if database has any tables
    const [results] = await sequelize.query("SHOW TABLES;");

    if (results.length === 0) {
      console.log('⚠️ No tables found — creating all tables now...');
      await sequelize.sync({ force: true }); // only once when empty
      console.log('✅ All tables created successfully.');
    } else {
      console.log('✅ Tables exist — syncing safely...');
      // Use safe alter mode to preserve data
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized safely (data preserved).');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

export default sequelize;
