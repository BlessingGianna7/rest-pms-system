require('dotenv').config();
const express       = require('express');
const swaggerUi     = require('swagger-ui-express');
const sequelize     = require('./config/database');
const swaggerSpec   = require('./swagger');

const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const slotRoutes    = require('./routes/slotRoutes');
const requestRoutes = require('./routes/requestRoutes');
const logRoutes     = require('./routes/logRoutes');
require('./models/associations')


const app = express();
app.use(express.json());
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/vehicles',     vehicleRoutes);
app.use('/api/parking-slots',slotRoutes);
app.use('/api/slot-requests',requestRoutes);
app.use('/api/logs',         logRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // OPTIONAL: Clean up if you previously had an ENUM type
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
          DROP TYPE enum_users_role;
        END IF;
      END
      $$;
    `);

    // Manually make sure 'role' column is plain VARCHAR with default 'user'
    await sequelize.query(`
      ALTER TABLE users 
        ALTER COLUMN role DROP DEFAULT,
        ALTER COLUMN role DROP NOT NULL,
        ALTER COLUMN role TYPE VARCHAR USING role::text,
        ALTER COLUMN role SET DEFAULT 'user',
        ALTER COLUMN role SET NOT NULL;
    `);

    // Sync models (but avoid altering existing columns again)
    await sequelize.sync(); // no `{ alter: true }` here
    console.log('✅ Models synchronized');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
      console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
    });
  } catch (err) {
    console.error('❌ Unable to start server:', err);
    process.exit(1);
  }
})();
