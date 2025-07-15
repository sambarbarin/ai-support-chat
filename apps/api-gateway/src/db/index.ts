import { Sequelize } from 'sequelize';

// Get database configuration from environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME || 'chat_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: dbHost,
  port: parseInt(dbPort, 10),
  database: dbName,
  username: dbUser,
  password: dbPassword,
  logging: false, // Set to console.log to see SQL queries
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
