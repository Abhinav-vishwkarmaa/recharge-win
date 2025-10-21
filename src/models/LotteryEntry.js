import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Lottery from './Lottery.js';
import Recharge from './Recharge.js';

const LotteryEntry = sequelize.define('LotteryEntry', {
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
  lottery_id: {
    type: DataTypes.UUID,
    references: {
      model: Lottery,
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
    allowNull: false,
  },
  lottery_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  is_winner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'LotteryEntries',
});

// Associations
LotteryEntry.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasMany(LotteryEntry, { foreignKey: 'user_id', as: 'LotteryEntries' });

LotteryEntry.belongsTo(Lottery, { foreignKey: 'lottery_id', as: 'Lottery' });
Lottery.hasMany(LotteryEntry, { foreignKey: 'lottery_id', as: 'LotteryEntries' });

LotteryEntry.belongsTo(Recharge, { foreignKey: 'recharge_id', as: 'Recharge' });
Recharge.hasMany(LotteryEntry, { foreignKey: 'recharge_id', as: 'LotteryEntries' });

export default LotteryEntry;