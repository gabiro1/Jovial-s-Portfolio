const express = require('express');
const {
  getSettings,
  updateAccount,
  updateSecurity
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/account', protect, updateAccount);
router.put('/security', protect, updateSecurity);

module.exports = router;