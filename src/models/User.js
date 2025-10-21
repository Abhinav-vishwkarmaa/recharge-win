import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  profile_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referral_code: {
    type: DataTypes.STRING,
    unique: true,
  },
  referred_by_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
}, {
  timestamps: true,
  tableName: 'Users',
});

// Associations
User.belongsTo(User, { as: 'Referrer', foreignKey: 'referred_by_id' });
User.hasMany(User, { as: 'Referrals', foreignKey: 'referred_by_id' });

export default User;