const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  github: { type: String, default: '' },
  technologies: [{ type: String }],
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);