const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Development', 'Design'] },
  level: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);