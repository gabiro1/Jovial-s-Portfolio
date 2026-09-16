const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, version: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getOrCreate();
    res.json({
      ...settings.toObject(),
      account: {
        name: req.user.name,
        email: req.user.email,
        lastLoginAt: req.user.lastLoginAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined && String(name).trim()) {
      user.name = String(name).trim();
    }

    if (email !== undefined && String(email).trim().toLowerCase() !== user.email) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Enter your current password to change the email.' });
      }
      const ok = await user.comparePassword(currentPassword);
      if (!ok) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      if (!EMAIL_RE.test(String(email).trim())) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      const duplicate = await User.findOne({ email: String(email).trim().toLowerCase() });
      if (duplicate) {
        return res.status(400).json({ message: 'That email is already in use.' });
      }
      user.email = String(email).trim().toLowerCase();
    }

    let sessionRevoked = false;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Enter your current password to set a new password.' });
      }
      const ok = await user.comparePassword(currentPassword);
      if (!ok) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }
      user.password = newPassword;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      sessionRevoked = true;
    }

    await user.save();

    const token = signToken(user);
    res.json({
      message: sessionRevoked
        ? 'Account updated. Other sessions have been signed out.'
        : 'Account updated.',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSecurity = async (req, res) => {
  try {
    const {
      loginProtectionEnabled,
      failedLoginThreshold,
      lockoutMinutes,
      autoLogoutEnabled,
      sessionTimeoutMinutes
    } = req.body;

    const settings = await Settings.getOrCreate();

    if (loginProtectionEnabled !== undefined) {
      settings.loginProtectionEnabled = !!loginProtectionEnabled;
    }
    if (failedLoginThreshold !== undefined) {
      settings.failedLoginThreshold = Math.min(
        Math.max(parseInt(failedLoginThreshold, 10) || 5, 1),
        20
      );
    }
    if (lockoutMinutes !== undefined) {
      settings.lockoutMinutes = Math.min(
        Math.max(parseInt(lockoutMinutes, 10) || 15, 1),
        1440
      );
    }
    if (autoLogoutEnabled !== undefined) {
      settings.autoLogoutEnabled = !!autoLogoutEnabled;
    }
    if (sessionTimeoutMinutes !== undefined) {
      settings.sessionTimeoutMinutes = Math.min(
        Math.max(parseInt(sessionTimeoutMinutes, 10) || 0, 0),
        1440
      );
    }

    await settings.save();
    res.json({ message: 'Security settings saved.', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};