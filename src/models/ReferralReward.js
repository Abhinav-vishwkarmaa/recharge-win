import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Recharge from './Recharge.js';

const ReferralReward = sequelize.define('ReferralReward', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  referrer_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  referred_user_id: {
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
    allowNull: false,
  },
  reward_percentage: {
    type: DataTypes.DECIMAL(5, 2), // e.g., 10.00 for 10%
    allowNull: false,
  },
  reward_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  credited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'ReferralRewards',
});

// Associations
ReferralReward.belongsTo(User, { foreignKey: 'referrer_id', as: 'Referrer' });
User.hasMany(ReferralReward, { foreignKey: 'referrer_id', as: 'ReferralRewards' });

ReferralReward.belongsTo(User, { foreignKey: 'referred_user_id', as: 'ReferredUser' });
User.hasMany(ReferralReward, { foreignKey: 'referred_user_id', as: 'ReceivedReferralRewards' });

ReferralReward.belongsTo(Recharge, { foreignKey: 'recharge_id', as: 'Recharge' });
Recharge.hasMany(ReferralReward, { foreignKey: 'recharge_id', as: 'ReferralRewards' });

export default ReferralReward;