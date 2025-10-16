import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Lottery from './Lottery.js';

const Winner = sequelize.define('Winner', {
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
    unique: true,
    allowNull: false,
  },
  prize_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  poster_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approved_by_admin_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: true,
  },
  declared_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'Winners',
});

// Associations
Winner.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Winner.belongsTo(Lottery, { foreignKey: 'lottery_id', as: 'Lottery' });
Winner.belongsTo(User, { foreignKey: 'approved_by_admin_id', as: 'ApprovedByAdmin' });

export default Winner;