import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  lottery_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by_admin_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'Coupons',
});

// Associations
Coupon.belongsTo(User, { foreignKey: 'created_by_admin_id', as: 'CreatedByAdmin' });
User.hasMany(Coupon, { foreignKey: 'created_by_admin_id', as: 'CreatedCoupons' });

// Lottery association will be defined after Lottery model is loaded
// This is handled in the main app.js file to avoid circular dependencies

export default Coupon;