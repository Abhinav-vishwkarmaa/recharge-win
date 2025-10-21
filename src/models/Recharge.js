import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Coupon from './Coupon.js';

const Recharge = sequelize.define('Recharge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  coupon_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  recharge_phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  wallet_amount_used: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  cash_amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  lottery_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  simulated_order_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending',
  },
  processed_by_admin_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'Recharges',
});

// Associations
Recharge.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasMany(Recharge, { foreignKey: 'user_id', as: 'Recharges' });
Recharge.belongsTo(User, { foreignKey: 'processed_by_admin_id', as: 'ProcessedByAdmin' });

Recharge.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'Coupon' });
Coupon.hasMany(Recharge, { foreignKey: 'coupon_id', as: 'Recharges' });

export default Recharge;