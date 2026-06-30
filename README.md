# 𝜗ৎ Vibely

A full-stack Instagram-style social media app — profiles, posts with images, comments, likes, a follow-request system, 24-hour stories, and real-time-feeling notifications.

## Features

- **Auth** — register/login with JWT, bcrypt-hashed passwords
- **Profiles** — avatar upload, bio, website, post grid
- **Posts** — text and/or image posts, like/unlike (persisted per user, no duplicate likes), comments
- **Follow requests** — send a request, recipient accepts or declines from a Notifications page before you start following
- **Followers/Following lists** — clickable, opens a modal showing each list
- **Post detail view** — click any post to see full image, all comments, and who liked it
- **Stories** — image stories that auto-expire and are deleted (file + DB row) after 24 hours, with a "seen by" viewer list, manual delete option, tap-through viewer with progress bars
- **Notifications** — bell icon badge showing pending follow request count
- **Search** — find users by username
- **Dark/light theme toggle**

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Axios, react-icons |
| Backend | Express.js |
| Database | MySQL via Sequelize ORM |
| Auth | JWT + bcryptjs |
| File uploads | Multer |

## Project Structure

```
vibely/
├── backend/
│   ├── config/db.js              # Sequelize/MySQL connection
│   ├── models/                   # User, Post, Comment, Follow, FollowRequest, Like, Story, StoryView
│   ├── routes/                   # auth, posts, comments, users, followRequests, stories
│   ├── middleware/                # authMiddleware (JWT), upload (multer)
│   ├── utils/storyCleanup.js     # hourly job that deletes expired stories
│   ├── uploads/                  # uploaded images (gitignored)
│   ├── server.js
│   └── .env                      # not committed — see .env.example
└── frontend/
    └── src/
        ├── pages/                # Login, Register, Feed, Profile, Notifications
        ├── components/           # Navbar, PostCard, PostModal, CommentBox, CreatePost,
        │                         # StoryBar, StoryViewer, FollowListModal
        ├── context/ThemeContext.jsx
        └── index.css
```

## Setup

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server running locally (or remotely)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/vibely.git
cd vibely

cd backend
npm install

cd ../frontend
npm install
```

### 2. Create the database

```sql
CREATE DATABASE social_app;
```

### 3. Configure environment variables

In `backend/`, copy `.env.example` to `.env` and fill in your own values:

```bash
cd backend
cp .env.example .env
```

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="your_mysql_password"
DB_NAME=social_app
JWT_SECRET=replace_with_a_long_random_string
PORT=5000
```

> If your MySQL password contains special characters like `#`, wrap it in double quotes as shown above.

### 4. Run the backend

```bash
cd backend
node server.js
```

Tables are auto-created/synced on first run via `sequelize.sync({ alter: true })`. You should see:

```
✅ Database connected & synced!
🚀 Server running on port 5000
```

### 5. Run the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register`, `/login` | Auth |
| `GET/POST /api/posts`, `PUT /:id/like`, `DELETE /:id` | Posts |
| `GET /api/posts/:id/likes` | Who liked a post |
| `GET/POST /api/comments/:postId` | Comments |
| `GET /api/users/:id`, `/:id/followers`, `/:id/following`, `/search` | Profiles |
| `PUT /api/users/profile/update` | Edit bio/website/avatar |
| `DELETE /api/users/:id/unfollow` | Unfollow |
| `POST /api/follow/send/:id`, `PUT /accept/:id`, `PUT /reject/:id` | Follow requests |
| `GET /api/follow/received`, `/sent`, `/count`, `/status/:id` | Follow request status |
| `GET/POST /api/stories`, `POST /:id/view`, `GET /:id/viewers`, `DELETE /:id` | Stories |

## Notes

- Images are served statically from `backend/uploads/` at `/uploads/<filename>`.
- Stories are cleaned up automatically once an hour (and on server startup) by `utils/storyCleanup.js`, which deletes both the database row and the image file once `expiresAt` has passed.
- The frontend currently points to `http://localhost:5000` directly in API calls — if deploying, replace these with an environment variable (e.g. `VITE_API_URL`).

## License

MIT — feel free to fork and build on this.
