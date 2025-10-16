import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

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
  simulated_order_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  tableName: 'Recharges',
});

// Associations
Recharge.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

export default Recharge;