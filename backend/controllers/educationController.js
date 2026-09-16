const Education = require('../models/Education');

exports.getEducations = async (req, res) => {
  try {
    const educations = await Education.find().sort({ order: 1, createdAt: 1 });
    res.json(educations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEducation = async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json(education);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!education) return res.status(404).json({ message: 'Education not found' });
    res.json(education);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) return res.status(404).json({ message: 'Education not found' });
    res.json({ message: 'Education deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};