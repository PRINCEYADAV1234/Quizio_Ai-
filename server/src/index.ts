import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import { requireAuth } from './middleware/auth';
import {
  syncUser,
  getProfile,
  uploadPDF,
  uploadPDFAndGenerateQuiz,
  getPDFs,
  getPDFDetails,
  generateQuizFromPDF,
  getQuizzes,
  getQuizDetails,
  submitAttempt,
  getAttempts,
  getFlashcardsByPDF,
  getSummariesByPDF,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getNotifications,
  markNotificationRead,
  clearAllPDFs,
  clearAllQuizzes,
  clearAllNotifications
} from './controllers/controllers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Multer for Local Uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
// 1. Auth/User Routes
app.post('/api/users/sync', requireAuth, syncUser);
app.get('/api/users/profile', requireAuth, getProfile);

// 2. PDF Routes
app.post('/api/pdfs/upload', requireAuth, upload.single('file'), uploadPDF);
app.post('/api/pdfs/upload-and-generate-quiz', requireAuth, upload.single('file'), uploadPDFAndGenerateQuiz);
app.get('/api/pdfs', requireAuth, getPDFs);
app.get('/api/pdfs/:id', requireAuth, getPDFDetails);
app.delete('/api/pdfs', requireAuth, clearAllPDFs);

// 3. Quiz Routes
app.post('/api/quizzes/generate', requireAuth, generateQuizFromPDF);
app.get('/api/quizzes', requireAuth, getQuizzes);
app.get('/api/quizzes/:id', requireAuth, getQuizDetails);
app.delete('/api/quizzes', requireAuth, clearAllQuizzes);

// 4. Attempt Routes
app.post('/api/quizzes/:id/attempts', requireAuth, submitAttempt);
app.get('/api/attempts/history', requireAuth, getAttempts);

// 5. Flashcards and Summaries
app.get('/api/flashcards/pdf/:pdfId', requireAuth, getFlashcardsByPDF);
app.get('/api/summaries/pdf/:pdfId', requireAuth, getSummariesByPDF);

// 6. Bookmarks
app.get('/api/bookmarks', requireAuth, getBookmarks);
app.post('/api/bookmarks', requireAuth, addBookmark);
app.delete('/api/bookmarks/:quizId', requireAuth, removeBookmark);

// 7. Notifications
app.get('/api/notifications', requireAuth, getNotifications);
app.put('/api/notifications/:id/read', requireAuth, markNotificationRead);
app.delete('/api/notifications', requireAuth, clearAllNotifications);

// Root and Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Quizio AI Backend is running 🚀'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'quizio-backend' });
});

// Connect to Database
connectDB();

// Start Server locally if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
