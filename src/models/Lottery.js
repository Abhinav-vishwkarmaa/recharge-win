import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Recharge from './Recharge.js';

const Lottery = sequelize.define('Lottery', {
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
  recharge_id: {
    type: DataTypes.UUID,
    references: {
      model: Recharge,
      key: 'id',
    },
    unique: true,
    allowNull: false,
  },
  lottery_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'won', 'lost', 'expired'),
    defaultValue: 'active',
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'Lotteries',
});

// Associations
Lottery.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Lottery.belongsTo(Recharge, { foreignKey: 'recharge_id', as: 'Recharge' });

export default Lottery;