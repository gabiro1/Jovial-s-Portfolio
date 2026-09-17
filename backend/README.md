# Portfolio Backend & Admin Dashboard

Dynamic backend for the portfolio built with **Node.js (Express.js) + JavaScript + MongoDB (Mongoose)**.

## Features

- **Dynamic portfolio** — all content (bio, skills, projects, experience, education, social links) is served from MongoDB
- **Admin dashboard** — manage every piece of content from `/dashboard`, using the same design language as the portfolio (Space Grotesk + Inter, monochrome black/white, minimal borders)
- **Contact messages** — form submissions are saved to the database and shown in the dashboard
- **Protected API** — JWT auth, only the admin can create/update/delete content
- **File uploads** — profile photo, project screenshots, skill icons (Multer)
- **Responsive** — dashboard works on mobile (collapsible sidebar)

## Quick start

```bash
cd backend
npm install
npm run seed     # populate DB with current portfolio content + admin user
npm run dev      # or npm start
```

- Portfolio: http://localhost:5000
- Admin dashboard: http://localhost:5000/dashboard or http://localhost:5000/admin
- Admin login: `jovialgfleuron@yopmail.com` / `admin123`
  (changeable in `backend/.env`)

## Configuration (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `ADMIN_DEFAULT_EMAIL` | Admin email seeded on first run |
| `ADMIN_DEFAULT_PASSWORD` | Admin password |

## Project structure

```
portfolio-root/
├── frontend/
│   ├── portfolio/      # Dynamic portfolio site (served at /)
│   ├── dashboard/      # Admin dashboard (served at /dashboard)
│   └── uploads/        # Uploaded images (served at /uploads)
└── backend/
    ├── server.js       # Express app entry point
    ├── seed.js         # Seeds DB with existing portfolio content
    ├── config/db.js    # MongoDB connection (with retries)
    ├── models/         # Mongoose schemas
    │   ├── User.js  Bio.js  Skill.js  Project.js
    │   ├── Experience.js  Education.js  SocialLink.js  ContactMessage.js
    │   ├── Service.js  ServiceRequest.js  Settings.js
    ├── controllers/    # Route handlers (CRUD per resource)
    ├── routes/         # Express routers
    ├── middleware/     # auth (JWT) + upload (Multer)
    └── views/          # (reserved for future EJS templates)
```

## API overview

Public endpoints (no auth):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bio` | Get biography/profile |
| GET | `/api/skills` | List skills |
| GET | `/api/projects` | List projects |
| GET | `/api/experience` | List experience |
| GET | `/api/education` | List education |
| GET | `/api/social-links` | List social links |
| POST | `/api/contact` | Submit a contact message |
| POST | `/api/auth/login` | Admin login (returns JWT) |

Protected endpoints (send `Authorization: Bearer <token>`):

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/bio/:id` | Update biography |
| POST/PUT/DELETE | `/api/skills[/:id]` | Manage skills |
| POST/PUT/DELETE | `/api/projects[/:id]` | Manage projects (image upload) |
| POST/PUT/DELETE | `/api/experience[/:id]` | Manage experience |
| POST/PUT/DELETE | `/api/education[/:id]` | Manage education |
| POST/PUT/DELETE | `/api/social-links[/:id]` | Manage social links |
| GET | `/api/contact` | List messages |
| PUT | `/api/contact/:id/read` | Mark message read/unread |
| DELETE | `/api/contact/:id` | Delete message |
| POST | `/api/upload/image` | Upload an image |

## MongoDB notes

The default config uses a **local** MongoDB at `mongodb://localhost:27017/portfolio`.

To use **MongoDB Atlas**, uncomment the Atlas `MONGODB_URI` in `.env`. If you use a
`mongodb+srv://` URI and get a DNS/SRV error, either:
- add your current IP to the Atlas **Network Access → IP allowlist**, or
- convert the URI to a direct seedlist (`mongodb://user:pass@shard00...:27017,.../db?ssl=true&replicaSet=...&authSource=admin`) as shown in the commented line.