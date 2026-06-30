# 𝜗ৎ Vibely

A full-stack Instagram-style social app — profiles, posts with images, comments, likes, follow requests, 24-hour stories, and notifications.

## Features

- JWT auth with bcrypt-hashed passwords
- Profiles with avatar upload, bio, website, post grid
- Posts (text/image), persisted likes (no duplicates), comments
- Follow requests — recipient accepts/declines before following begins
- Followers/Following lists, clickable post detail view (likes + comments)
- Stories — auto-delete after 24h (DB row + image file), "seen by" list, manual delete
- Notification badge for pending follow requests
- User search, dark/light theme toggle

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Axios, react-icons |
| Backend | Express.js |
| Database | MySQL + Sequelize |
| Auth | JWT + bcryptjs |
| Uploads | Multer |

## Project Structure

```
vibely/
├── backend/
│   ├── config/db.js          # MySQL connection
│   ├── models/                # User, Post, Comment, Follow, FollowRequest, Like, Story, StoryView
│   ├── routes/                # auth, posts, comments, users, followRequests, stories
│   ├── middleware/            # authMiddleware, upload
│   ├── utils/storyCleanup.js  # hourly job that deletes expired stories
│   ├── uploads/                # gitignored
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── pages/              # Login, Register, Feed, Profile, Notifications
        ├── components/         # Navbar, PostCard, PostModal, CommentBox, CreatePost,
        │                       # StoryBar, StoryViewer, FollowListModal
        ├── context/ThemeContext.jsx
        └── index.css
```

## Setup

**Prerequisites:** Node.js 18+, MySQL Server running locally.

```bash
git clone https://github.com/<your-username>/vibely.git
cd vibely/backend && npm install
cd ../frontend && npm install
```

Create the database:
```sql
CREATE DATABASE social_app;
```

In `backend/`, create `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="your_mysql_password"
DB_NAME=social_app
JWT_SECRET=replace_with_a_long_random_string
PORT=5000
```
> Wrap the password in double quotes if it contains special characters like `#`.

Run the backend (tables auto-create on first run):
```bash
cd backend
node server.js
```

Run the frontend in a separate terminal:
```bash
cd frontend
npm run dev
```

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

- Images served from `backend/uploads/` at `/uploads/<filename>`.
- A schema-only reference dump is at `backend/schema.sql` (no data).
- API base URL is hardcoded to `http://localhost:5000` in the frontend — swap for an env variable if deploying beyond local use.

## License

MIT