const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const storyRoutes = require('./routes/stories');
require('./models/Story');
require('./models/StoryView');
const cleanupExpiredStories = require('./utils/storyCleanup');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const followRequestRoutes = require('./routes/followRequests');

require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Follow');
require('./models/FollowRequest');
require('./models/Like');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/stories', storyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRequestRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database connected & synced!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
    // run cleanup on startup, then every hour
    cleanupExpiredStories();
    setInterval(cleanupExpiredStories, 60 * 60 * 1000);
  })
  .catch(err => console.error('❌ DB Error:', err));