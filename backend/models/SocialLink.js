const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  iconClass: { type: String, default: '' },
  position: { type: String, enum: ['hero', 'footer', 'both'], default: 'both' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SocialLink', socialLinkSchema);