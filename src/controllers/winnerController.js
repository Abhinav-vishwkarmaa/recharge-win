import Winner from '../models/Winner.js';
import Lottery from '../models/Lottery.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files locally
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const declareWinner = async (req, res, next) => {
  try {
    const { lotteryId, prizeDescription } = req.body;

    const lottery = await Lottery.findByPk(lotteryId);
    if (!lottery || lottery.status !== 'active') {
      return res.status(400).json({ message: 'Invalid or inactive lottery' });
    }

    const winner = await Winner.create({
      user_id: lottery.user_id,
      lottery_id: lotteryId,
      prize_description: prizeDescription,
      declared_at: new Date(),
    });

    await lottery.update({ status: 'won' });

    res.status(201).json({ message: 'Winner declared', winner });
  } catch (err) {
    next(err);
  }
};

export const approveWinner = async (req, res, next) => {
  try {
    const { winnerId } = req.params;
    const winner = await Winner.findByPk(winnerId);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });

    await winner.update({ is_approved: true, approved_by_admin_id: req.user.id });

    res.json({ message: 'Winner approved', winner });
  } catch (err) {
    next(err);
  }
};

export const uploadPoster = [
  upload.single('poster'),
  async (req, res, next) => {
    try {
      const { winnerId } = req.params;

      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const winner = await Winner.findByPk(winnerId);
      if (!winner) return res.status(404).json({ message: 'Winner not found' });

      await winner.update({ poster_image_url: req.file.path });

      res.json({ message: 'Poster uploaded', posterUrl: req.file.path });
    } catch (err) {
      next(err);
    }
  },
];

export const addWinnerComment = async (req, res, next) => {
  try {
    const { winnerId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const winner = await Winner.findByPk(winnerId);
    if (!winner) {
      return res.status(404).json({ message: 'Winner not found' });
    }

    // Only allow winner to comment
    if (winner.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Only winner can add comments' });
    }

    await winner.update({ winner_comment: comment.trim() });

    res.json({ message: 'Comment added successfully', winner_comment: comment.trim() });
  } catch (err) {
    next(err);
  }
};