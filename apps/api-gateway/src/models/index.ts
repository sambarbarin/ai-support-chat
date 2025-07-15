import Conversation from './Conversation';
import Message from './Message';
import sequelize from '../db';

// Initialize models
const models = {
  Conversation,
  Message,
};

// Sync database
export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
    throw error;
  }
};

export default models;
