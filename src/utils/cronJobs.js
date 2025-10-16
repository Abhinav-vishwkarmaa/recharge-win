import cron from 'node-cron';
import { Op } from 'sequelize';
import Lottery from '../models/Lottery.js';

// Schedule job to expire lotteries every hour
const lotteryExpirationJob = cron.schedule('0 * * * *', async () => {
  try {
    const expiredCount = await Lottery.update(
      { status: 'expired' },
      {
        where: {
          expires_at: {
            [Op.lt]: new Date(),
          },
          status: 'active',
        },
      }
    );
    if (expiredCount[0] > 0) {
      console.log(`Expired ${expiredCount[0]} lottery entries.`);
    }
  } catch (error) {
    console.error('Error expiring lotteries:', error);
  }
}, {
  scheduled: false, // Don't start automatically
});

// Function to start the cron job
const startCronJobs = () => {
  lotteryExpirationJob.start();
  console.log('Lottery expiration cron job started.');
};

export default {
  start: startCronJobs,
  stop: () => lotteryExpirationJob.stop(),
};