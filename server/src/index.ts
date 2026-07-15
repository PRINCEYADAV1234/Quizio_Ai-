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
  getBookmarks,
  addBookmark,
  removeBookmark,
  getNotifications,
  markNotificationRead,
  clearAllPDFs,
  clearAllQuizzes,
  clearAllNotifications,
  generateQuizFromImageOCR
} from './controllers/controllers';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Temp upload directory — files are deleted immediately after parsing
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Multer for PDF uploads — 100MB limit, temp disk storage (deleted after parse)
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Multer for Image uploads (OCR feature)
const imageUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or WEBP image files are allowed for OCR'));
    }
  },
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit for images
});

// Middlewares
app.use(cors());
app.use(express.json());
// Note: No /uploads static route — PDF files are deleted immediately after parsing

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

// 5. Flashcards
app.get('/api/flashcards/pdf/:pdfId', requireAuth, getFlashcardsByPDF);
// Note: Summary feature removed

// 6. Bookmarks
app.get('/api/bookmarks', requireAuth, getBookmarks);
app.post('/api/bookmarks', requireAuth, addBookmark);
app.delete('/api/bookmarks/:quizId', requireAuth, removeBookmark);

// 7. Notifications
app.get('/api/notifications', requireAuth, getNotifications);
app.put('/api/notifications/:id/read', requireAuth, markNotificationRead);
app.delete('/api/notifications', requireAuth, clearAllNotifications);

// 8. OCR: Image (handwritten/scanned) → Quiz
app.post('/api/ocr/generate-quiz', requireAuth, imageUpload.single('image'), generateQuizFromImageOCR);

// Health Check
app.get('/', (_req, res) => res.json({ status: 'OK', message: 'Quizio AI Backend is running 🚀' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'quizio-backend' }));

// Global Error Handling Middleware (Catches MulterErrors cleanly)
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size is too large. Max limit is 100MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
  next();
});

// Connect to Database
connectDB();

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
