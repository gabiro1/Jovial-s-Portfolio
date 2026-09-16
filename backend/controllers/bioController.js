const Bio = require('../models/Bio');

// Get the bio (single document)
exports.getBio = async (req, res) => {
  try {
    let bio = await Bio.findOne().sort({ createdAt: -1 });
    if (!bio) {
      bio = await Bio.create({ fullName: 'Your Name', headline: 'Your Title' });
    }
    res.json(bio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create bio
exports.createBio = async (req, res) => {
  try {
    const bio = await Bio.create(req.body);
    res.status(201).json(bio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update bio (by id)
exports.updateBio = async (req, res) => {
  try {
    const bio = await Bio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bio) return res.status(404).json({ message: 'Bio not found' });
    res.json(bio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};