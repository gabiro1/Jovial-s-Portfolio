const express = require('express');
const {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getExperiences);
router.post('/', protect, createExperience);
router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

module.exports = router;