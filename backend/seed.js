const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Bio = require('./models/Bio');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const SocialLink = require('./models/SocialLink');
const ContactMessage = require('./models/ContactMessage');
const Service = require('./models/Service');
const ServiceRequest = require('./models/ServiceRequest');

dotenv.config();

const PROJECT_ROOT = path.join(__dirname, '..');
const UPLOADS_DIR = path.join(__dirname, '..', 'frontend', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const copyToUploads = (sourceRelative, destName) => {
  const src = path.join(PROJECT_ROOT, sourceRelative);
  if (!fs.existsSync(src)) {
    console.warn(`  ! source not found: ${sourceRelative}`);
    return null;
  }
  fs.copyFileSync(src, path.join(UPLOADS_DIR, destName));
  return '/uploads/' + destName;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Clearing existing content collections...');
    await Promise.all([
      Bio.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Education.deleteMany({}),
      SocialLink.deleteMany({}),
      ContactMessage.deleteMany({}),
      Service.deleteMany({}),
      ServiceRequest.deleteMany({})
    ]);

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    // ---------- Admin user ----------
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@portfolio.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    await User.deleteMany({});
    await User.create({ email: adminEmail, password: adminPassword, name: 'Admin' });
    console.log(`Admin created -> ${adminEmail} / ${adminPassword}`);

    // ---------- Images ----------
    console.log('Copying images...');
    const profileImage = copyToUploads('PFF.jpg', 'PFF.jpg');
    const blogImage = copyToUploads('hblablog.png', 'hblablog.png');
    const jobImage = copyToUploads('Plain.png', 'Plain.png');
    const smileImage = copyToUploads('smile.png', 'smile.png');

    // ---------- Bio ----------
    const bio = await Bio.create({
      fullName: 'Jovial',
      heroLines: ['Web Developer,', 'UI & UX Designer', 'Based in Kigali'],
      greeting: "Hi, I'm",
      about:
        "Hi, I'm Jovial, Web Developer ft UI & UX Designer. Passionate about creating beautiful and functional web experiences.",
      location: 'Kigali, Rwanda',
      email: 'gabirojfleuron@gmail.com',
      phone: '+250780259327',
      whatsapp: '+250780259327',
      profileImage
    });
    console.log('Bio seeded ->', bio.fullName);

    // ---------- Skills ----------
    const skillDefaults = [
      { name: 'JavaScript', category: 'Development', level: 'Intermediate', icon: '/uploads/js.png', order: 0 },
      { name: 'React', category: 'Development', level: 'Intermediate', icon: '/uploads/react.png', order: 1 },
      { name: 'Django', category: 'Development', level: 'Intermediate', icon: '/uploads/django.png', order: 2 },
      { name: 'Git', category: 'Development', level: 'Intermediate', icon: '/uploads/git.svg', order: 3 },
      { name: 'Figma', category: 'Design', level: 'Advanced', icon: '/uploads/figma.png', order: 0 },
      { name: 'Adobe XD', category: 'Design', level: 'Intermediate', icon: '/uploads/xd.png', order: 1 },
      { name: 'CSS3', category: 'Design', level: 'Expert', icon: '/uploads/css.png', order: 2 },
      { name: 'HTML', category: 'Design', level: 'Advanced', icon: '/uploads/html.png', order: 3 }
    ];

    // Copy skill icon files (with fallback warning, use existing assets)
    const skillIconSrcs = {
      'js.png': 'assets/img/icons8-javascript-50.png',
      'react.png': 'assets/img/icons8-react-80.png',
      'django.png': 'assets/img/icons8-django-a-high-level-python-web-framework-that-encourages-rapid-development-24.png',
      'git.svg': 'assets/img/git-icon.svg',
      'figma.png': 'assets/img/icons8-figma-50.png',
      'xd.png': 'assets/img/icons8-adobe-xd-50.png',
      'css.png': 'assets/img/icons8-css-48.png',
      'html.png': 'assets/img/icons8-html-50.png'
    };

    for (const [dest, src] of Object.entries(skillIconSrcs)) {
      copyToUploads(src, dest);
    }

    const skills = await Skill.insertMany(
      skillDefaults.map((s, i) => ({ ...s, order: i }))
    );
    console.log(`Skills seeded -> ${skills.length}`);

    // ---------- Projects ----------
    const projects = await Project.insertMany([
      {
        title: 'Blog Website',
        description: 'A full featured blog application built with a modern frontend stack.',
        type: 'Frontend',
        image: blogImage,
        link: 'https://github.com/gabiro1/Blog-Application.git',
        github: 'https://github.com/gabiro1/Blog-Application.git',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        order: 0,
        featured: true
      },
      {
        title: 'Job Searching',
        description: 'A job searching platform interface with an intuitive, clean UX.',
        type: 'Frontend',
        image: jobImage,
        link: '#',
        github: '',
        technologies: ['React', 'CSS'],
        order: 1,
        featured: true
      },
      {
        title: 'SmileSchool',
        description: 'A responsive website project focusing on delightful user experiences.',
        type: 'Website',
        image: smileImage,
        link: '#',
        github: '',
        technologies: ['HTML', 'CSS'],
        order: 2,
        featured: true
      }
    ]);
    console.log(`Projects seeded -> ${projects.length}`);

    // ---------- Experience ----------
    const experiences = await Experience.insertMany([
      {
        role: 'Frontend Developer',
        company: 'Freelances',
        duration: 'Jan 2024 - Present',
        description: '',
        order: 0
      },
      {
        role: 'UI/UX Designer',
        company: 'Freelances',
        duration: 'Jan 2023 - Feb 2025',
        description: '',
        order: 1
      },
      {
        role: 'Web Development Intern',
        company: 'Hb-Lab',
        duration: 'Mar 2025 - May 2025',
        description: '',
        order: 2
      }
    ]);
    console.log(`Experiences seeded -> ${experiences.length}`);

    // ---------- Education ----------
    const educations = await Education.insertMany([
      {
        degree: 'Bachelor of Information Technology',
        institution: 'University of Rwanda',
        duration: '2022 - 2026',
        description: '',
        order: 0
      },
      {
        degree: 'Advanced Diploma in MCE',
        institution: 'College Adventist du Rwankeri',
        duration: '2015 - 2021',
        description: '',
        order: 1
      }
    ]);
    console.log(`Educations seeded -> ${educations.length}`);

    // ---------- Services ----------
    const services = await Service.insertMany([
      {
        name: 'Web Development',
        description: 'Modern, responsive websites and web apps built with clean, maintainable code and a fast, smooth experience.',
        icon: 'ri-code-line',
        price: 'From $300',
        order: 0
      },
      {
        name: 'UI/UX Design',
        description: 'Intuitive interfaces and delightful user experiences — from wireframes and prototypes to polished final screens.',
        icon: 'ri-palette-line',
        price: 'From $200',
        order: 1
      },
      {
        name: 'Graphic Design',
        description: 'Eye-catching visuals and marketing assets — social media creatives, posters and banners that tell your story.',
        icon: 'ri-quill-pen-line',
        price: 'From $150',
        order: 2
      },
      {
        name: 'Branding & Logo',
        description: 'Complete brand identities and memorable logos — colors, typography and guidelines that make you stand out.',
        icon: 'ri-brush-line',
        price: 'From $100',
        order: 3
      },
      {
        name: 'Responsive Redesign',
        description: 'Turn your existing website into a smooth, mobile-first experience that works beautifully on every device.',
        icon: 'ri-smartphone-line',
        price: 'From $250',
        order: 4
      },
      {
        name: 'Maintenance & Support',
        description: 'Keep your site fast, secure and up to date with regular care, backups, updates and quick fixes.',
        icon: 'ri-tools-line',
        price: 'From $50/mo',
        order: 5
      }
    ]);
    console.log(`Services seeded -> ${services.length}`);

    // ---------- Social links ----------
    const socials = await SocialLink.insertMany([
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/gabiro-jovial-fleuron-454115247', iconClass: 'ri-linkedin-box-line', position: 'both', order: 0 },
      { platform: 'GitHub', url: 'https://github.com/gabiro1', iconClass: 'ri-github-line', position: 'both', order: 1 },
      { platform: 'Twitter / X', url: 'https://x.com/Jovial_GABIRO', iconClass: 'ri-twitter-line', position: 'hero', order: 2 },
      { platform: 'Dribbble', url: 'https://dribbble.com/jovial_fleuron', iconClass: 'ri-dribbble-line', position: 'footer', order: 3 },
      { platform: 'Behance', url: 'https://www.behance.net/jovialgabiro', iconClass: 'ri-behance-line', position: 'footer', order: 4 },
      { platform: 'Instagram', url: 'https://www.instagram.com/jovial_fleuron/', iconClass: 'ri-instagram-line', position: 'footer', order: 5 }
    ]);
    console.log(`Social links seeded -> ${socials.length}`);

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();