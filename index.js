require('dotenv').config();
const engineerRouter = require('./routes/engineers')
const express = require('express');
const connectDB = require('./config/database');
const authRouter = require('./routes/auth');
const cookieParser = require('cookie-parser');
const projectsRouter = require('./routes/projects');
const assignmentsRouter = require('./routes/assignments');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use('/', express.json());
app.use('/', cookieParser());
app.use(cors({
  origin: ['http://localhost:5173','https://geekyants-frontend.vercel.app/', 'https://geekyants-frontend-qian.vercel.app'],  // Your frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('public'));


app.use('/api/engineers', engineerRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/assignments', assignmentsRouter);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Basic GET route
    app.get('/', (req, res) => {
      res.json({ message: 'Hello World!' });
    });

    // Start server only after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 