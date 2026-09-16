const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const settings = await Settings.getOrCreate();
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: 'Too many failed attempts. Account temporarily locked. Try again in ' + mins + ' min.'
      });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      if (settings.loginProtectionEnabled) {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        user.lastFailedAt = new Date();

        if (user.failedAttempts >= settings.failedLoginThreshold) {
          user.lockUntil = new Date(Date.now() + settings.lockoutMinutes * 60000);
          user.failedAttempts = 0;
          await user.save();
          return res.status(423).json({
            message: 'Too many failed attempts. Account locked for ' + settings.lockoutMinutes + ' min.'
          });
        }

        await user.save();
        const remaining = settings.failedLoginThreshold - user.failedAttempts;
        return res.status(401).json({
          message: 'Invalid credentials. ' + remaining + ' attempt(s) remaining before lockout.'
        });
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.failedAttempts = 0;
    user.lastFailedAt = undefined;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};