const express = require('express');
const { getBio, createBio, updateBio } = require('../controllers/bioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBio);
router.post('/', protect, createBio);
router.put('/:id', protect, updateBio);

module.exports = router;