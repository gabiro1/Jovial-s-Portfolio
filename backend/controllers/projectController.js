const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedProjects = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 3;
    let projects = await Project.find({ featured: true }).sort({ order: 1, createdAt: 1 }).limit(limit);
    if (projects.length === 0) {
      projects = await Project.find().sort({ order: 1, createdAt: 1 }).limit(limit);
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const project = await Project.create(data);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    const project = await Project.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};