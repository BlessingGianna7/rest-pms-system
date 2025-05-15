const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { initializeDatabase } = require('./config/dbInit');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const slotRoutes = require('./routes/slotRoutes');
const requestRoutes = require('./routes/requestRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking-slots', slotRoutes);
app.use('/api/slot-requests', requestRoutes);
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;

// Start the server after initializing the database
const startServer = async () => {
  try {
    // Initialize database tables
    const dbInitialized = await initializeDatabase();
    
    if (dbInitialized) {
      // Start the server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      });
    } else {
      console.error('Failed to initialize database. Server not started.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Run the server
startServer();