import User from '../models/User.js';
import UserCoupon from '../models/UserCoupon.js';
import Lottery from '../models/Lottery.js';
import LotteryEntry from '../models/LotteryEntry.js';
import Recharge from '../models/Recharge.js';
import Coupon from '../models/Coupon.js';
import { Op } from 'sequelize';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'phone_number', 'wallet_balance', 'referral_code', 'role'],
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getRewards = async (req, res, next) => {
  try {
    const [coupons, lotteries] = await Promise.all([
      UserCoupon.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Coupon, as: 'Coupon' }],
      }),
      LotteryEntry.findAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Lottery,
            as: 'Lottery',
            attributes: ['title', 'prize_amount', 'draw_date'],
          },
          {
            model: Recharge,
            as: 'Recharge',
            attributes: ['amount', 'status'],
          },
        ],
        attributes: ['id', 'lottery_number', 'is_winner', 'createdAt'],
      }),
    ]);

    res.json({
      coupons: coupons.map(uc => ({
        id: uc.id,
        code: uc.Coupon.code,
        description: uc.Coupon.description,
        discountValue: uc.Coupon.discount_value,
        expiresAt: uc.Coupon.expires_at,
        isUsed: uc.is_used,
      })),
      lotteries: lotteries.map(le => ({
        id: le.id,
        lotteryNumber: le.lottery_number,
        isWinner: le.is_winner,
        lottery: le.Lottery,
        recharge: le.Recharge,
        createdAt: le.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};