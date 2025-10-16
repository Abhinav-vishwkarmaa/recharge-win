import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import Recharge from '../models/Recharge.js';
import Lottery from '../models/Lottery.js';
import Coupon from '../models/Coupon.js';
import UserCoupon from '../models/UserCoupon.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const initiateSchema = Joi.object({
  rechargePhoneNumber: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
  operator: Joi.string().required(),
  amount: Joi.number().min(10).max(10000).required(),
});

export const initiate = async (req, res, next) => {
  try {
    const { error } = initiateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { rechargePhoneNumber, operator, amount } = req.body;
    const orderId = uuidv4();

    await Recharge.create({
      user_id: req.user.id,
      recharge_phone_number: rechargePhoneNumber,
      operator,
      amount,
      simulated_order_id: orderId,
    });

    res.json({
      orderId,
      amount,
      status: 'pending',
    });
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID required' });

    const recharge = await Recharge.findOne({
      where: { simulated_order_id: orderId, user_id: req.user.id },
    });

    if (!recharge) return res.status(404).json({ message: 'Recharge not found' });
    if (recharge.status !== 'pending') return res.status(400).json({ message: 'Recharge already processed' });

    // Simulate success/failure randomly
    const isSuccess = Math.random() > 0.2; // 80% success rate

    if (isSuccess) {
      await recharge.update({ status: 'success' });

      // Create lottery
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);
      const lotteryNumber = Math.random().toString(36).substring(2, 8).toUpperCase();

      await Lottery.create({
        user_id: req.user.id,
        recharge_id: recharge.id,
        lottery_number: lotteryNumber,
        expires_at: expiresAt,
      });

      // Assign random active coupon
      const coupon = await Coupon.findOne({
        where: {
          is_active: true,
          expires_at: { [Op.gt]: new Date() },
        },
        order: [['createdAt', 'DESC']],
      });

      if (coupon) {
        await UserCoupon.create({
          user_id: req.user.id,
          coupon_id: coupon.id,
        });
      }

      // Credit referral wallet if first recharge
      const rechargeCount = await Recharge.count({
        where: { user_id: req.user.id, status: 'success' },
      });

      if (rechargeCount === 1 && recharge.referred_by_id) {
        await User.increment('wallet_balance', {
          by: 10,
          where: { id: recharge.referred_by_id },
        });
      }

      return res.json({ message: 'Recharge verified', status: 'success' });
    } else {
      await recharge.update({ status: 'failed' });
      return res.json({ message: 'Recharge failed', status: 'failed' });
    }
  } catch (err) {
    next(err);
  }
};