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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prize_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  draw_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'Lotteries',
});

// Associations
Lottery.belongsTo(User, { foreignKey: 'created_by_admin_id', as: 'CreatedByAdmin' });
User.hasMany(Lottery, { foreignKey: 'created_by_admin_id', as: 'CreatedLotteries' });

export default Lottery;