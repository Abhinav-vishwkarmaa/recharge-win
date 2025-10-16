import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Coupon from './Coupon.js';

const UserCoupon = sequelize.define('UserCoupon', {
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
    references: {
      model: Coupon,
      key: 'id',
    },
    allowNull: false,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'UserCoupons',
});

// Associations
UserCoupon.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'Coupon' });

export default UserCoupon;