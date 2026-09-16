const Experience = require('../models/Experience');

exports.getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: 1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json(experience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    res.json(experience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};