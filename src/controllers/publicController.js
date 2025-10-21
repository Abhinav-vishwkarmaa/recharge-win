import Winner from '../models/Winner.js';
import User from '../models/User.js';
import Lottery from '../models/Lottery.js';

export const getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.findAll({
      where: { is_approved: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['phone_number', 'profile_image_url'],
        },
        {
          model: Lottery,
          as: 'Lottery',
          attributes: ['title', 'prize_amount'],
        },
      ],
      order: [['declared_at', 'DESC']],
    });

    const formattedWinners = winners.map(winner => ({
      id: winner.id,
      phoneNumber: winner.User.phone_number.slice(-4), // Last 4 digits
      profileImageUrl: winner.User.profile_image_url,
      prizeAmount: winner.prize_amount,
      lotteryTitle: winner.Lottery.title,
      posterImageUrl: winner.poster_image_url,
      winnerComment: winner.winner_comment,
      declaredAt: winner.declared_at,
    }));

    res.json(formattedWinners);
  } catch (err) {
    next(err);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const Coupon = (await import('../models/Coupon.js')).default;

    const coupons = await Coupon.findAll({
      where: { is_active: true },
      include: [
        {
          model: Lottery,
          as: 'Lottery',
          where: { is_active: true },
          required: true,
          attributes: ['id', 'title', 'prize_amount', 'draw_date', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(coupons);
  } catch (err) {
    next(err);
  }
};