import express from 'express';
import { getWinners, getCoupons } from '../controllers/publicController.js';

const router = express.Router();

router.get('/winners', getWinners);
router.get('/coupons', getCoupons);

export default router;