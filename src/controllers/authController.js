import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import generateReferralCode from '../utils/generateReferralCode.js';

const registerSchema = Joi.object({
  phoneNumber: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().min(6).required(),
  referralCode: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin').optional(),
});

const loginSchema = Joi.object({
  phoneNumber: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().required(),
});

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { phoneNumber, password, referralCode, role } = req.body;

    const existingUser = await User.findOne({ where: { phone_number: phoneNumber } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    let referredById = null;
    if (referralCode) {
      const referrer = await User.findOne({ where: { referral_code: referralCode } });
      if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });
      referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newReferralCode = generateReferralCode();

    const user = await User.create({
      phone_number: phoneNumber,
      password: hashedPassword,
      referral_code: newReferralCode,
      referred_by_id: referredById,
      role: role || 'user', // Allow role specification for admin creation
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ where: { phone_number: phoneNumber } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        walletBalance: user.wallet_balance,
        referralCode: user.referral_code,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};