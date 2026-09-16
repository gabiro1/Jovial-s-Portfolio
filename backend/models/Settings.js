const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    loginProtectionEnabled: {
      type: Boolean,
      default: true
    },
    failedLoginThreshold: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    lockoutMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440
    },
    autoLogoutEnabled: {
      type: Boolean,
      default: false
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 30,
      min: 0,
      max: 1440
    }
  },
  { timestamps: true }
);

settingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);