import User from '../models/User.js';
import Recharge from '../models/Recharge.js';
import Lottery from '../models/Lottery.js';
import Coupon from '../models/Coupon.js';
import Winner from '../models/Winner.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, rechargeCount, revenueResult, activeLotteries] = await Promise.all([
      User.count(),
      Recharge.count({ where: { status: { [Op.in]: ['completed', 'approved'] } } }),
      Recharge.sum('cash_amount_paid', { where: { status: { [Op.in]: ['completed', 'approved'] } } }),
      Lottery.count({ where: { is_active: true } }),
    ]);

    res.json({
      users: userCount,
      recharges: rechargeCount,
      revenue: revenueResult || 0,
      activeLotteries,
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'phone_number', 'wallet_balance', 'referral_code', 'role', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users,
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

export const createCoupon = async (req, res, next) => {
  try {
    const { title, operator, description, imageUrl, amount, quantity, lotteryId, expiresAt } = req.body;

    // Validate that lottery exists
    const LotteryModel = (await import('../models/Lottery.js')).default;
    const lottery = await LotteryModel.findByPk(lotteryId);
    if (!lottery) {
      return res.status(400).json({ message: 'Invalid lottery ID' });
    }

    // Remove special characters from title and description for MySQL compatibility
    const cleanTitle = title.replace(/[^\x20-\x7E]/g, '');
    const cleanDescription = description.replace(/[^\x20-\x7E]/g, '');

    const coupon = await Coupon.create({
      title: cleanTitle,
      operator,
      description: cleanDescription,
      image_url: imageUrl,
      amount,
      quantity,
      lottery_id: lotteryId,
      expires_at: expiresAt,
      created_by_admin_id: req.user.id,
    });

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (err) {
    console.error('Coupon creation error:', err);
    next(err);
  }
};

export const getActiveLotteries = async (req, res, next) => {
  try {
    const lotteries = await Lottery.findAll({
      where: { status: 'active' },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'phone_number'],
        },
        {
          model: Recharge,
          as: 'Recharge',
          attributes: ['id', 'amount', 'operator'],
        },
      ],
      order: [['expires_at', 'ASC']],
    });

    res.json(lotteries);
  } catch (err) {
    next(err);
  }
};

export const createLottery = async (req, res, next) => {
  try {
    const { title, prizeAmount, description, drawDate } = req.body;

    const lottery = await Lottery.create({
      title,
      prize_amount: prizeAmount,
      description,
      draw_date: drawDate,
      created_by_admin_id: req.user.id,
    });

    res.status(201).json({ message: 'Lottery created', lottery });
  } catch (err) {
    next(err);
  }
};

export const getActiveLotteriesNew = async (req, res, next) => {
  try {
    const lotteries = await Lottery.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: 'CreatedByAdmin',
          attributes: ['id', 'phone_number'],
        },
      ],
      order: [['draw_date', 'ASC']],
    });

    res.json(lotteries);
  } catch (err) {
    next(err);
  }
};

export const getPendingRecharges = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: recharges } = await Recharge.findAndCountAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'phone_number', 'profile_image_url'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      recharges,
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

export const processRecharge = async (req, res, next) => {
  try {
    const { rechargeId, action } = req.body; // action: 'approve' or 'reject'

    const recharge = await Recharge.findByPk(rechargeId);
    if (!recharge) {
      return res.status(404).json({ message: 'Recharge not found' });
    }

    if (action === 'approve') {
      recharge.status = 'completed';
      recharge.processed_by_admin_id = req.user.id;
      recharge.processed_at = new Date();
      await recharge.save();

      // Generate unique lottery number
      const lotteryNumber = await generateUniqueLotteryNumber();
      await Recharge.update(
        { lottery_number: lotteryNumber },
        { where: { id: rechargeId } }
      );

      // Create lottery entry
      const coupon = await Coupon.findByPk(recharge.coupon_id);
      const LotteryEntry = (await import('../models/LotteryEntry.js')).default;

      await LotteryEntry.create({
        user_id: recharge.user_id,
        lottery_id: coupon.lottery_id,
        recharge_id: rechargeId,
        lottery_number: lotteryNumber,
      });

      // Process referral reward if applicable
      await processReferralReward(recharge.user_id, recharge.amount, rechargeId);

    } else if (action === 'reject') {
      recharge.status = 'rejected';
      recharge.processed_by_admin_id = req.user.id;
      recharge.processed_at = new Date();
      await recharge.save();

      // Refund wallet amount if used
      if (recharge.wallet_amount_used > 0) {
        await User.increment('wallet_balance', {
          by: recharge.wallet_amount_used,
          where: { id: recharge.user_id }
        });
      }
    }

    res.json({ message: `Recharge ${action}d successfully` });
  } catch (err) {
    next(err);
  }
};

export const declareWinner = async (req, res, next) => {
  try {
    const { lotteryId, rechargeId } = req.body;

    const lottery = await Lottery.findByPk(lotteryId);
    if (!lottery) {
      return res.status(404).json({ message: 'Lottery not found' });
    }

    const recharge = await Recharge.findByPk(rechargeId);
    if (!recharge) {
      return res.status(404).json({ message: 'Recharge not found' });
    }

    const winner = await Winner.create({
      user_id: recharge.user_id,
      lottery_id: lotteryId,
      recharge_id: rechargeId,
      prize_amount: lottery.prize_amount,
      declared_at: new Date(),
      approved_by_admin_id: req.user.id,
      is_approved: true,
    });

    // Credit prize amount to winner's wallet
    await User.increment('wallet_balance', {
      by: lottery.prize_amount,
      where: { id: recharge.user_id }
    });

    // Mark lottery entry as winner
    const LotteryEntry = (await import('../models/LotteryEntry.js')).default;
    await LotteryEntry.update(
      { is_winner: true },
      { where: { recharge_id: rechargeId } }
    );

    res.status(201).json({ message: 'Winner declared successfully', winner });
  } catch (err) {
    next(err);
  }
};

export const getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.findAll({
      where: { is_approved: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'phone_number', 'profile_image_url'],
        },
        {
          model: Lottery,
          as: 'Lottery',
          attributes: ['id', 'title', 'prize_amount'],
        },
      ],
      order: [['declared_at', 'DESC']],
    });

    res.json(winners);
  } catch (err) {
    next(err);
  }
};

// Helper functions
const generateUniqueLotteryNumber = async () => {
  const { v4: uuidv4 } = await import('uuid');
  let lotteryNumber;
  let exists = true;

  while (exists) {
    lotteryNumber = uuidv4().substring(0, 8).toUpperCase();
    const existing = await Recharge.findOne({ where: { lottery_number: lotteryNumber } });
    exists = !!existing;
  }

  return lotteryNumber;
};

const processReferralReward = async (userId, rechargeAmount, rechargeId) => {
  const user = await User.findByPk(userId);
  if (!user || !user.referred_by_id) return;

  const ReferralReward = (await import('../models/ReferralReward.js')).default;

  // Get admin-configured reward percentage (default 10%)
  const rewardPercentage = 10.00; // This could be configurable
  const rewardAmount = (rechargeAmount * rewardPercentage) / 100;

  await ReferralReward.create({
    referrer_id: user.referred_by_id,
    referred_user_id: userId,
    recharge_id: rechargeId,
    reward_percentage: rewardPercentage,
    reward_amount: rewardAmount,
  });

  // Credit reward to referrer's wallet
  await User.increment('wallet_balance', {
    by: rewardAmount,
    where: { id: user.referred_by_id }
  });
};