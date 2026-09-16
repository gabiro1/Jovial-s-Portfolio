const express = require('express');
const {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest
} = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getRequests);
router.post('/', createRequest);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;