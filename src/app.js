import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import cronJobs from './utils/cronJobs.js';

// Models for associations
import Coupon from './models/Coupon.js';
import Lottery from './models/Lottery.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rechargeRoutes from './routes/rechargeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

// Define associations after all models are imported
Coupon.belongsTo(Lottery, { foreignKey: 'lottery_id', as: 'Lottery' });
Lottery.hasMany(Coupon, { foreignKey: 'lottery_id', as: 'Coupons' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/recharge', rechargeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorMiddleware);

// Start cron jobs
cronJobs.start();

export default app;