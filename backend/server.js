const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const bioRoutes = require('./routes/bioRoutes');
const skillRoutes = require('./routes/skillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const socialLinkRoutes = require('./routes/socialLinkRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use('/dashboard', express.static(path.join(FRONTEND_DIR, 'dashboard')));
app.use('/uploads', express.static(path.join(FRONTEND_DIR, 'uploads')));
app.use('/', express.static(path.join(FRONTEND_DIR, 'portfolio')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Dashboard redirect
app.get('/admin', (req, res) => res.redirect('/dashboard/index.html'));

// Project detail page
app.get('/projects/:id', (req, res) =>
  res.sendFile(path.join(FRONTEND_DIR, 'portfolio', 'project.html'))
);

// Legacy section URLs now live on the single-page home
app.get(['/projects', '/skills', '/education', '/connect', '/services'], (req, res) =>
  res.redirect('/')
);

// Create default admin if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@portfolio.com';
    const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const existing = await User.findOne({ email });
    if (!existing) {
      await User.create({ email, password, name: 'Admin' });
      console.log(`Default admin created: ${email} (password: ${password})`);
    }
  } catch (error) {
    console.error('Failed to create default admin:', error.message);
  }
};

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
  createDefaultAdmin();
});