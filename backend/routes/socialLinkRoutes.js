const express = require('express');
const {
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink
} = require('../controllers/socialLinkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSocialLinks);
router.post('/', protect, createSocialLink);
router.put('/:id', protect, updateSocialLink);
router.delete('/:id', protect, deleteSocialLink);

module.exports = router;