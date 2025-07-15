//api-gateway/src/index.ts
import express from 'express';
import cors from 'cors';
import { testConnection } from './db';
import { syncDatabase } from './models';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Use routes
app.use('/', routes);

const PORT = 3001;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    await syncDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`API Gateway running on port ${PORT}`);
      console.log(`Database connected and models synchronized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
