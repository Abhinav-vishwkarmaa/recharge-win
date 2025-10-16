import User from '../models/User.js';
import UserCoupon from '../models/UserCoupon.js';
import Lottery from '../models/Lottery.js';
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
      Lottery.findAll({
        where: { user_id: req.user.id },
        attributes: ['id', 'lottery_number', 'status', 'expires_at', 'createdAt'],
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
      lotteries,
    });
  } catch (err) {
    next(err);
  }
};