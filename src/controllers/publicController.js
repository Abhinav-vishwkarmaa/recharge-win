import Winner from '../models/Winner.js';
import User from '../models/User.js';

export const getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.findAll({
      where: { is_approved: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['phone_number'],
        },
      ],
      order: [['declared_at', 'DESC']],
    });

    const formattedWinners = winners.map(winner => ({
      id: winner.id,
      phoneNumber: winner.User.phone_number.slice(-4), // Last 4 digits
      prizeDescription: winner.prize_description,
      posterImageUrl: winner.poster_image_url,
      declaredAt: winner.declared_at,
    }));

    res.json(formattedWinners);
  } catch (err) {
    next(err);
  }
};