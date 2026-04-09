# 🚀 DevTrack – Career Operating System for Developers

> A full-stack web application for aspiring software engineers to track coding habits, internship applications, and career readiness.

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.18-lightgrey)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://mongoosejs.com)
[![React](https://img.shields.io/badge/React-v18-blue)](https://react.dev)

---

## 📌 What is DevTrack?

DevTrack is a **Career Operating System** — not just a habit tracker. It connects daily coding effort, internship application tracking, and focus sessions into a unified **Career Score** (0–100).

---

## 🏗 Architecture

```
server/
  config/         → DB singleton (Singleton Pattern)
  models/         → Mongoose schemas (TrackableEntity mixin for OOP)
  repositories/   → BaseRepository + 5 entity repos (Repository Pattern)
  services/       → Business logic layer (6 services)
  controllers/    → Thin HTTP layer (6 controllers)
  routes/         → 6 route files
  middleware/     → JWT auth, global error handler
  utils/
    CareerScoreEngine.js  → Strategy Pattern (4 scoring strategies)
    GitHubAdapter.js      → Adapter Pattern (wraps GitHub REST API)

client/
  src/
    pages/        → Dashboard, Habits, Internships, Focus, GitHub
    components/   → Sidebar
    context/      → AuthContext
    api/          → Axios services layer
```

### Design Patterns Applied

| Pattern | Implementation |
|---|---|
| **Repository** | `BaseRepository` → 5 entity repositories |
| **Strategy** | `CareerScoreEngine` – 4 scoring strategies (40/30/20/10%) |
| **Singleton** | DB connection, CareerScoreEngine, GitHubAdapter |
| **Adapter** | `GitHubAdapter` wraps GitHub REST API |

### OOP Principles

| Principle | Where |
|---|---|
| **Encapsulation** | Business logic sealed in Services, hidden from controllers |
| **Abstraction** | `BaseRepository` abstract class, `ScoringStrategy` abstract class |
| **Inheritance** | All repos extend `BaseRepository`; concrete strategies extend `ScoringStrategy` |
| **Polymorphism** | `CareerScoreEngine.calculate()` calls `.calculate()` on any strategy |

---

## 🔋 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Axios  
**Frontend:** React 18, Vite, React Router, Recharts, CSS (glassmorphism dark mode)

---

## 🚀 Running Locally

### Backend
```bash
cd server
cp .env.example .env  # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev           # runs on port 5000
```

### Frontend
```bash
cd client
npm install
npm run dev           # runs on port 5173
```

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login + JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/habits` | List / Create habits |
| POST | `/api/habits/:id/log` | Log activity |
| GET/POST | `/api/internships` | List / Add applications |
| PATCH | `/api/internships/:id/status` | Update pipeline status |
| GET | `/api/internships/stats` | Funnel analytics |
| POST | `/api/focus/start` | Start Pomodoro session |
| PATCH | `/api/focus/:id/end` | End session |
| POST | `/api/github/connect` | Link GitHub |
| GET | `/api/github/sync` | Sync commits |
| GET | `/api/dashboard` | Aggregated dashboard |

---

## 🎓 SESD Project – Milestone Documentation

- [idea.md](./idea.md) – Project scope + key features  
- [useCaseDiagram.md](./useCaseDiagram.md) – Use case diagram  
- [sequenceDiagram.md](./sequenceDiagram.md) – Main flow end-to-end  
- [classDiagram.md](./classDiagram.md) – Major classes + relationships  
- [ErDiagram.md](./erDiagram.md) – ER diagram  
