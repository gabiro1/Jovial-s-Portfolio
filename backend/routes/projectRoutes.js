const express = require('express');
const {
  getProjects,
  getFeaturedProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/:id', getProject);
router.post('/', protect, upload.single('image'), createProject);
router.put('/:id', protect, upload.single('image'), updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;