import express from 'express';
import { getWinners } from '../controllers/publicController.js';

const router = express.Router();

router.get('/winners', getWinners);

export default router;