# 🚀 TaskLY

A modern, collaborative workspace and skill management platform.

TaskLY is a productivity-focused application that helps teams organize, monitor, and track work across projects. With role-based access control, task assignment, milestone tracking, a calendar view, and an AI coach, TaskLY gives teams a structured way to measure growth and maintain consistency.

## Features

- **Workspaces** — Create and manage collaborative workspaces with members and roles
- **Role-Based Access** — Admins manage tasks and approve milestones; members add milestones and view progress
- **Task Kanban** — Create and assign tasks with priority, due dates, and status columns
- **Milestones** — Members add milestones; Admins cross them off after review
- **Calendar** — Visual deadline and task calendar with assignee display
- **Skill Streaks** — Track daily practice and build streaks
- **Logs** — Session logs with notes for each skill
- **AI Coach (TaskLY AI)** — Personalized AI-powered progress coaching
- **Google OAuth + Custom JWT Auth** — Flexible login options
- **Email Verification** — Powered by Nodemailer + Brevo SMTP
- **Dark / Light Mode** — System-aware theme switching

## Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand  
**Backend:** Node.js, Express, TypeScript, MongoDB + Mongoose  
**Auth:** Custom JWT + bcrypt + Google OAuth (Passport.js)  
**Email:** Nodemailer + Brevo SMTP  
**AI:** Google Gemini API  

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Brevo account (free) for email

### Server

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (MongoDB URI, JWT secret, Brevo SMTP credentials)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` for the full list of required server environment variables including Brevo SMTP setup.

---

© 2025 TaskLY. All rights reserved.
