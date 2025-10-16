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
      Recharge.count({ where: { status: 'success' } }),
      Recharge.sum('amount', { where: { status: 'success' } }),
      Lottery.count({ where: { status: 'active' } }),
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
    const { code, description, discountValue, expiresAt } = req.body;

    const coupon = await Coupon.create({
      code,
      description,
      discount_value: discountValue,
      expires_at: expiresAt,
      created_by_admin_id: req.user.id,
    });

    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
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