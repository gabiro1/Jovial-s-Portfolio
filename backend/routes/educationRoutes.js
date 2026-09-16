const express = require('express');
const {
  getEducations,
  createEducation,
  updateEducation,
  deleteEducation
} = require('../controllers/educationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEducations);
router.post('/', protect, createEducation);
router.put('/:id', protect, updateEducation);
router.delete('/:id', protect, deleteEducation);

module.exports = router;