import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import Recharge from '../models/Recharge.js';
import Lottery from '../models/Lottery.js';
import Coupon from '../models/Coupon.js';
import UserCoupon from '../models/UserCoupon.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const initiateSchema = Joi.object({
  couponId: Joi.string().required(),
  rechargePhoneNumber: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
  useWallet: Joi.boolean().optional(),
});

export const initiate = async (req, res, next) => {
  try {
    const { error } = initiateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { couponId, rechargePhoneNumber, useWallet = false } = req.body;

    // Check if coupon exists and is active
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon || !coupon.is_active) {
      return res.status(400).json({ message: 'Invalid or inactive coupon' });
    }

    // Check quantity limit
    const existingRecharges = await Recharge.count({
      where: { coupon_id: couponId, status: { [Op.in]: ['pending', 'completed'] } }
    });
    if (existingRecharges >= coupon.quantity) {
      return res.status(400).json({ message: 'Coupon quantity limit reached' });
    }

    const user = await User.findByPk(req.user.id);
    let walletAmountUsed = 0;
    let cashAmountPaid = coupon.amount;

    // Calculate wallet usage
    if (useWallet && user.wallet_balance > 0) {
      walletAmountUsed = Math.min(user.wallet_balance, coupon.amount);
      cashAmountPaid = coupon.amount - walletAmountUsed;
    }

    const orderId = uuidv4();

    await Recharge.create({
      user_id: req.user.id,
      coupon_id: couponId,
      recharge_phone_number: rechargePhoneNumber,
      operator: coupon.operator,
      amount: coupon.amount,
      wallet_amount_used: walletAmountUsed,
      cash_amount_paid: cashAmountPaid,
      simulated_order_id: orderId,
    });

    res.json({
      orderId,
      coupon: {
        title: coupon.title,
        operator: coupon.operator,
        amount: coupon.amount,
      },
      payment: {
        walletUsed: walletAmountUsed,
        cashToPay: cashAmountPaid,
      },
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

    // For COD, we assume payment is collected and recharge is ready to be processed by admin
    // For now, we'll mark it as "approved" status which means payment collected, waiting for admin processing
    const isPaymentSuccess = Math.random() > 0.1; // 90% payment success rate

    if (isPaymentSuccess) {
      await recharge.update({ status: 'approved' });

      // Deduct wallet amount if used
      if (recharge.wallet_amount_used > 0) {
        await User.decrement('wallet_balance', {
          by: recharge.wallet_amount_used,
          where: { id: req.user.id }
        });
      }

      return res.json({
        message: 'Payment successful, recharge will be processed by admin',
        status: 'approved',
        orderId: recharge.simulated_order_id
      });
    } else {
      await recharge.update({ status: 'rejected' });
      return res.json({ message: 'Payment failed', status: 'failed' });
    }
  } catch (err) {
    next(err);
  }
};

export const getUserRecharges = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: recharges } = await Recharge.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Coupon,
          as: 'Coupon',
          attributes: ['id', 'title', 'operator', 'amount'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const formattedRecharges = recharges.map(recharge => ({
      id: recharge.id,
      coupon: recharge.Coupon,
      rechargePhoneNumber: recharge.recharge_phone_number,
      operator: recharge.operator,
      amount: recharge.amount,
      walletUsed: recharge.wallet_amount_used,
      cashPaid: recharge.cash_amount_paid,
      lotteryNumber: recharge.lottery_number,
      status: recharge.status,
      createdAt: recharge.createdAt,
      processedAt: recharge.processed_at,
    }));

    res.json({
      recharges: formattedRecharges,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};