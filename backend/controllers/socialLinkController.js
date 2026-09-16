const SocialLink = require('../models/SocialLink');

exports.getSocialLinks = async (req, res) => {
  try {
    const links = await SocialLink.find().sort({ order: 1, createdAt: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSocialLink = async (req, res) => {
  try {
    const link = await SocialLink.create(req.body);
    res.status(201).json(link);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSocialLink = async (req, res) => {
  try {
    const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!link) return res.status(404).json({ message: 'Social link not found' });
    res.json(link);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSocialLink = async (req, res) => {
  try {
    const link = await SocialLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ message: 'Social link not found' });
    res.json({ message: 'Social link deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};