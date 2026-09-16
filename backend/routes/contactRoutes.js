const express = require('express');
const {
  submitMessage,
  getMessages,
  getMessage,
  toggleRead,
  deleteMessage
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', submitMessage);
router.get('/', protect, getMessages);
router.get('/:id', protect, getMessage);
router.put('/:id/read', protect, toggleRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;