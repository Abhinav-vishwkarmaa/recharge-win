import cron from 'node-cron';
import { Op } from 'sequelize';
import Lottery from '../models/Lottery.js';
import LotteryEntry from '../models/LotteryEntry.js';
import Winner from '../models/Winner.js';
import User from '../models/User.js';

// Schedule job to run daily lottery draw at midnight (00:00)
const dailyLotteryDrawJob = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Starting daily lottery draw...');

    // Find all active lotteries that are past their draw date
    const lotteriesToDraw = await Lottery.findAll({
      where: {
        is_active: true,
        draw_date: {
          [Op.lt]: new Date(),
        },
      },
      include: [
        {
          model: LotteryEntry,
          as: 'LotteryEntries',
          where: { is_winner: false },
          required: false,
        },
      ],
    });

    for (const lottery of lotteriesToDraw) {
      const entries = lottery.LotteryEntries || [];

      if (entries.length === 0) {
        console.log(`No entries for lottery ${lottery.id}, skipping draw.`);
        continue;
      }

      // Select random winner
      const winnerEntry = entries[Math.floor(Math.random() * entries.length)];

      // Create winner record
      await Winner.create({
        user_id: winnerEntry.user_id,
        lottery_id: lottery.id,
        recharge_id: winnerEntry.recharge_id,
        prize_amount: lottery.prize_amount,
        declared_at: new Date(),
        is_approved: true, // Auto-approve for daily draws
      });

      // Mark lottery entry as winner
      await LotteryEntry.update(
        { is_winner: true },
        { where: { id: winnerEntry.id } }
      );

      // Credit prize amount to winner's wallet
      await User.increment('wallet_balance', {
        by: lottery.prize_amount,
        where: { id: winnerEntry.user_id }
      });

      // Deactivate lottery
      await Lottery.update(
        { is_active: false },
        { where: { id: lottery.id } }
      );

      console.log(`Lottery ${lottery.id} drawn. Winner: User ${winnerEntry.user_id}, Prize: ₹${lottery.prize_amount}`);
    }

    console.log('Daily lottery draw completed.');
  } catch (error) {
    console.error('Error in daily lottery draw:', error);
  }
}, {
  scheduled: false, // Don't start automatically
});

// Function to start the cron job
const startCronJobs = () => {
  dailyLotteryDrawJob.start();
  console.log('Daily lottery draw cron job started.');
};

export default {
  start: startCronJobs,
  stop: () => dailyLotteryDrawJob.stop(),
};