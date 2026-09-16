const ServiceRequest = require('../models/ServiceRequest');

// Public: submit a service request
exports.createRequest = async (req, res) => {
  try {
    const { service, fullName, email, phone, message } = req.body;
    if (!service || !fullName || !email) {
      return res.status(400).json({ message: 'Service, name and email are required' });
    }
    const request = await ServiceRequest.create({
      service,
      fullName,
      email,
      phone: phone || '',
      message: message || '',
      status: 'New'
    });
    res.status(201).json({ message: 'Service request sent successfully', id: request._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: list all requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: update request (e.g. change status)
exports.updateRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: delete request
exports.deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Service request not found' });
    res.json({ message: 'Service request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};