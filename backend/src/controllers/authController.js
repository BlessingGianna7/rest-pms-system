// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { Op } = require('sequelize');

const User = require('../models/User');
const Otp  = require('../models/Otp');
const Log  = require('../models/Log');
const { sendOtpEmail } = require('../utils/email');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // check for existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // optional: ensure only one admin ever
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      console.log('Admin already exists, this will be a user account');
    }

    // create user
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password:    hash,
      role:        'user',
      is_verified: false
    });

    // generate and store OTP
    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({
      user_id:     user.id,
      otp_code:    code,
      expires_at:  expiresAt,
      is_verified: false
    });

    // send email
    try {
      await sendOtpEmail(email, code);
      console.log('OTP email sent to:', email);
    } catch (e) {
      console.error('Email send failed:', e);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.status(201).json({ message: 'User registered, OTP sent', userId: user.id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { userId, otpCode } = req.body;
  if (!userId || !otpCode) {
    return res.status(400).json({ error: 'User ID and OTP code are required' });
  }

  try {
    const otp = await Otp.findOne({
      where: {
        user_id:    userId,
        otp_code:   otpCode,
        expires_at: { [Op.gt]: new Date() },
        is_verified: false
      }
    });
    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // mark OTP & user verified
    await otp.update({ is_verified: true });
    await User.update({ is_verified: true }, { where: { id: userId } });

    // log it
    await Log.create({ user_id: userId, action: 'User verified OTP' });

    res.json({ message: 'OTP verified, registration complete' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.resendOtp = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await User.findOne({ where: { id: userId, is_verified: false } });
    if (!user) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    // delete old OTPs & create a new one
    await Otp.destroy({ where: { user_id: userId } });
    const code      = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({
      user_id:     userId,
      otp_code:    code,
      expires_at:  expiresAt,
      is_verified: false
    });

    // email
    try {
      await sendOtpEmail(user.email, code);
      console.log('Resent OTP to:', user.email);
    } catch (e) {
      console.error('Email send failed:', e);
      return res.status(500).json({ error: 'Failed to resend OTP' });
    }

    // log
    await Log.create({ user_id: userId, action: 'OTP resent' });
    res.json({ message: 'OTP resent to email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Account not verified' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    await Log.create({ user_id: user.id, action: 'User logged in' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
