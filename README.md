# DevTrack — Career OS + Project Management Suite

> A full-stack productivity and project management platform for student developers — combining Linear's speed & aesthetics with Jira's issue management, plus a Career OS layer (habit tracking, internship pipeline, focus timer, GitHub sync).

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## Features

### 🗂️ Project Management (Jira/Linear-style)
| Feature | Description |
|---|---|
| **Projects** | Colour-coded projects with icon picker and progress tracking |
| **Kanban Board** | 5-column drag-and-drop board (Backlog → Todo → In Progress → In Review → Done) |
| **Issues List** | Grouped by status/priority, multi-select bulk operations |
| **Task Detail Panel** | Slide-in drawer with inline editing, markdown description, comments, activity timeline |
| **Cycles (Sprints)** | Time-boxed sprints with burndown stats and task backlog assignment |
| **`Cmd+K` Command Palette** | Global keyboard-shortcut search + quick navigation |
| **Activity Log** | Append-only audit trail for every task change |

### 📈 Career OS
| Feature | Description |
|---|---|
| **Habit Tracker** | Daily/weekly habits with streak tracking and DSA/Project/Learning types |
| **Internship Tracker** | Kanban pipeline (Applied → OA → Interview → Offer) with conversion stats |
| **Focus Mode** | Pomodoro-style timer with session history and weekly stats |
| **GitHub Sync** | Imports commit activity as habit logs; updates contribution heatmap |
| **Career Score** | Weighted composite score driven by habits, internships, and focus sessions |

---

## Tech Stack

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database with indexed schemas
- **JWT** — Stateless authentication
- **Helmet + express-rate-limit** — Security headers and brute-force protection
- **Clean Architecture** — Controllers → Services → Repositories → Models

### Frontend
- **React 19 + Vite** — Fast SPA
- **React Router v6** — Client-side routing
- **@dnd-kit** — Drag-and-drop Kanban
- **Recharts** — Charts and visualizations
- **Axios** — API client with JWT interceptors

---

## Architecture & Design Patterns

```
server/
├── config/          # DB singleton, env validation
├── controllers/     # HTTP layer — validate, delegate, respond
├── services/        # Business logic — domain rules, orchestration
├── repositories/    # Data access layer — Mongoose queries only
├── models/          # Mongoose schemas
├── middleware/       # Auth (protect), errorHandler
├── routes/          # Express routers
└── utils/           # AppError, asyncHandler, Validator, GitHubAdapter, CareerScoreEngine
```

| Pattern | Where Used |
|---|---|
| **Singleton** | `Database.connect()` — single Mongoose connection |
| **Repository** | All data access via `BaseRepository` subclasses |
| **Strategy** | `CareerScoreEngine` — swappable scoring strategies |
| **Adapter** | `GitHubAdapter` — wraps GitHub REST API |
| **Observer** | `ActivityRepository.log()` — called post-mutation in all services |
| **Factory** | Task creation via `TaskService.createTask()` — encapsulates defaults |

**OOP Principles observed:**
- **Encapsulation** — Services expose clean method APIs; no raw DB calls from controllers
- **Abstraction** — `Validator.assert()` hides all validation logic behind one call
- **Inheritance** — All repositories extend `BaseRepository` (CRUD inherited)
- **Polymorphism** — `CareerScoreEngine` strategies are interchangeable

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongodb://localhost:27017`)

### Setup

```bash
# Clone
git clone https://github.com/mrsandy1965/Devtrack.git
cd Devtrack

# Backend
cd server
cp .env.example .env     # fill in JWT_SECRET
npm install
npm run dev              # → http://localhost:3000

# Frontend (new terminal)
cd client
npm install
npm run dev              # → http://localhost:5173
```

### Environment Variables

**`server/.env`**
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/devtrack
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Projects & Tasks
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
GET    /api/projects/:id/board       # board view (grouped by status)
GET    /api/projects/:id/tasks       # list view (filterable)
POST   /api/projects/:id/tasks       # create task
PATCH  /api/tasks/:id                # update task (status, priority, etc.)
DELETE /api/tasks/:id
POST   /api/tasks/:id/comments
GET    /api/tasks/search?q=
POST   /api/tasks/reorder            # drag-drop persist
```

### Cycles (Sprints)
```
GET    /api/projects/:id/cycles
POST   /api/projects/:id/cycles
GET    /api/projects/:id/cycles/:cid
POST   /api/projects/:id/cycles/:cid/tasks
DELETE /api/projects/:id/cycles/:cid/tasks/:taskId
```

### Career OS
```
GET/POST   /api/habits
POST       /api/habits/:id/log
GET        /api/internships
POST       /api/github/connect
POST       /api/github/sync
GET        /api/focus/stats
GET        /api/dashboard
```

---

## Project Structure

```
Devtrack/
├── server/
│   ├── config/            # db.js (Singleton), env.js
│   ├── controllers/       # Auth, Habit, Internship, Focus, GitHub, Project, Task, Cycle
│   ├── middleware/        # auth.js (protect), errorHandler.js
│   ├── models/            # User, Habit, HabitLog, Internship, FocusSession, Project, Task, Comment, Cycle, ActivityLog
│   ├── repositories/      # BaseRepository + domain repos
│   ├── routes/            # Express routers
│   ├── services/          # Business logic layer
│   └── utils/             # AppError, asyncHandler, Validator, GitHubAdapter, CareerScoreEngine
└── client/
    ├── src/
    │   ├── api/           # services.js (all API calls), client.js (Axios + JWT)
    │   ├── components/    # Sidebar, Icons, TaskDetailPanel, CommandPalette
    │   ├── context/       # AuthContext
    │   └── pages/         # Dashboard, Habits, Internships, Focus, GitHub, Projects, Board, Issues, Cycles
    └── public/
```

---

## Commit History

Maintained via regular, realistic commits with progressive feature development across multiple days — demonstrating consistent version control practices for SESD evaluation.
