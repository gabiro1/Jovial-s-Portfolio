const mongoose = require('mongoose');

const bioSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  heroLines: [{ type: String }],
  tagline: { type: String, default: '' },
  about: { type: String, default: '' },
  location: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  greeting: { type: String, default: "Hi, I'm" }
}, { timestamps: true });

module.exports = mongoose.model('Bio', bioSchema);