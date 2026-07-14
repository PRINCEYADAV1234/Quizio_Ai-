import { Request, Response } from 'express';
import { User, PDF, Quiz, Attempt, Analytics, Flashcard, Summary, Bookmark, Notification } from '../models/Schemas';
import { generateSummary, generateQuiz, generateFlashcards } from '../config/gemini';
import cloudinary from '../config/cloudinary';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

// Helper to update analytics
async function updateAnalytics(userId: string, newScore: number, timeTakenSeconds: number) {
  try {
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }

    const attempts = await Attempt.find({ userId });
    const totalQuizzes = attempts.length + 1;
    const scoresSum = attempts.reduce((acc, curr) => acc + curr.score, 0) + newScore;
    const averageScore = Math.round(scoresSum / totalQuizzes);
    const studyTimeIncrement = Math.ceil(timeTakenSeconds / 60);

    analytics.totalQuizzes = totalQuizzes;
    analytics.averageScore = averageScore;
    analytics.studyTime += studyTimeIncrement;
    
    // Simple streak logic
    analytics.streak = (analytics.streak || 0) + 1;

    await analytics.save();
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

// ---------------- USER CONTROLLER ----------------
export const syncUser = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar, provider } = req.body;
    const firebaseUid = req.user?.uid;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'Missing firebaseUid' });
    }

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({
        firebaseUid,
        name: name || 'Quizio Scholar',
        email,
        avatar,
        provider: provider || 'email',
      });
      await user.save();

      // Create default analytics profile
      const analytics = new Analytics({ userId: firebaseUid });
      await analytics.save();

      // Create welcome notification
      const welcomeNotification = new Notification({
        userId: firebaseUid,
        title: 'Welcome to Quizio!',
        message: 'Upload your first PDF to generate summaries and interactive quizzes.',
        type: 'success',
      });
      await welcomeNotification.save();
    } else {
      // Update fields if changed
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Server error during user sync' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const analytics = await Analytics.findOne({ userId: firebaseUid }) || {
      totalQuizzes: 0,
      averageScore: 0,
      studyTime: 0,
      streak: 0,
      weakTopics: [],
    };

    res.json({ user, analytics });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- PDF CONTROLLER ----------------
export const uploadPDF = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;

    // 1. Upload to Cloudinary
    let fileUrl = '';
    let shouldDeleteFile = true;
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        folder: 'quizio_pdfs',
      });
      fileUrl = uploadResult.secure_url;
    } catch (cloudinaryError: any) {
      console.warn('Cloudinary upload failed, falling back to local file server:', cloudinaryError?.message || cloudinaryError);
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure ? 'https' : 'http';
      fileUrl = `${protocol}://${host}/uploads/${path.basename(filePath)}`;
      shouldDeleteFile = false; // keep local file to serve statically
    }

    // 2. Parse text from PDF
    const fileBuffer = fs.readFileSync(filePath);
    let parsedPdf;
    try {
      parsedPdf = await pdfParse(fileBuffer);
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return res.status(400).json({ error: 'Failed to read content from PDF file structure.' });
    }

    const textContent = parsedPdf.text || 'Empty document content';
    const totalPages = parsedPdf.numpages || 1;

    // Clean up local temp file if uploaded to Cloudinary successfully
    if (shouldDeleteFile) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }

    // 3. Create PDF Record
    const pdf = new PDF({
      userId: firebaseUid,
      title: req.file.originalname,
      fileUrl: fileUrl,
      totalPages,
      status: 'ready',
    });

    // 4. Generate AI Summary and save it
    const summaryText = await generateSummary(textContent);
    pdf.summary = summaryText;
    await pdf.save();

    const summary = new Summary({
      userId: firebaseUid,
      pdfId: pdf._id,
      title: pdf.title + ' Summary',
      content: summaryText,
    });
    await summary.save();

    // 5. Generate flashcards automatically
    const flashcardsData = await generateFlashcards(textContent, 6);
    for (const fc of flashcardsData) {
      await new Flashcard({
        userId: firebaseUid,
        pdfId: pdf._id,
        question: fc.question,
        answer: fc.answer,
      }).save();
    }

    // Create Notification
    await new Notification({
      userId: firebaseUid,
      title: 'PDF Uploaded and Analyzed',
      message: `Your file "${pdf.title}" has been parsed. Flashcards and Summary are ready.`,
      type: 'success',
    }).save();

    res.json({ pdf, summaryText, flashcardCount: flashcardsData.length });
  } catch (error) {
    console.error('Upload PDF general error:', error);
    res.status(500).json({ error: 'Failed to upload and analyze PDF' });
  }
};

export const uploadPDFAndGenerateQuiz = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { quizType, difficulty, questionCount, timeLimit, negativeMarking } = req.body;

    const filePath = req.file.path;

    // 1. Upload to Cloudinary
    let fileUrl = '';
    let shouldDeleteFile = true;
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
        folder: 'quizio_pdfs',
      });
      fileUrl = uploadResult.secure_url;
    } catch (cloudinaryError: any) {
      console.warn('Cloudinary upload failed, falling back to local file server:', cloudinaryError?.message || cloudinaryError);
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.secure ? 'https' : 'http';
      fileUrl = `${protocol}://${host}/uploads/${path.basename(filePath)}`;
      shouldDeleteFile = false; // keep local file to serve statically
    }

    // 2. Parse text from PDF
    const fileBuffer = fs.readFileSync(filePath);
    let parsedPdf;
    try {
      parsedPdf = await pdfParse(fileBuffer);
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return res.status(400).json({ error: 'Failed to read content from PDF file structure.' });
    }

    const textContent = parsedPdf.text || 'Empty document content';
    const totalPages = parsedPdf.numpages || 1;

    // Clean up local temp file if uploaded to Cloudinary successfully
    if (shouldDeleteFile) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }

    // 3. Create PDF Record
    const pdf = new PDF({
      userId: firebaseUid,
      title: req.file.originalname,
      fileUrl: fileUrl,
      totalPages,
      status: 'ready',
    });

    // 4. Generate AI Summary and save it
    const summaryText = await generateSummary(textContent);
    pdf.summary = summaryText;
    await pdf.save();

    const summary = new Summary({
      userId: firebaseUid,
      pdfId: pdf._id,
      title: pdf.title + ' Summary',
      content: summaryText,
    });
    await summary.save();

    // 5. Generate flashcards automatically
    const flashcardsData = await generateFlashcards(textContent, 6);
    for (const fc of flashcardsData) {
      await new Flashcard({
        userId: firebaseUid,
        pdfId: pdf._id,
        question: fc.question,
        answer: fc.answer,
      }).save();
    }

    // 6. Generate Prompt and Send to Gemini to receive JSON questions
    const qCount = Number(questionCount) || 5;
    const questions = await generateQuiz(textContent, quizType || 'mcq', difficulty || 'medium', qCount);

    // 7. Save Quiz in MongoDB
    const quiz = new Quiz({
      userId: firebaseUid,
      pdfId: pdf._id,
      title: `${pdf.title.replace('.pdf', '')} ${quizType.toUpperCase()} Quiz`,
      difficulty: difficulty || 'medium',
      quizType: quizType || 'mcq',
      questions,
      timeLimit: Number(timeLimit) || 10,
      negativeMarking: negativeMarking === 'true' || negativeMarking === true,
    });

    await quiz.save();

    // Create Notification
    await new Notification({
      userId: firebaseUid,
      title: 'PDF Uploaded & Quiz Ready!',
      message: `Your file "${pdf.title}" has been parsed. Quiz "${quiz.title}" is ready.`,
      type: 'success',
    }).save();

    res.json({ pdf, quiz, summaryText });
  } catch (error) {
    console.error('Upload and generate quiz error:', error);
    res.status(500).json({ error: 'Failed to upload PDF and generate quiz.' });
  }
};

export const getPDFs = async (req: Request, res: Response) => {
  try {
    const pdfs = await PDF.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (error) {
    res.status(550).json({ error: 'Server error' });
  }
};

export const getPDFDetails = async (req: Request, res: Response) => {
  try {
    const pdf = await PDF.findOne({ _id: req.params.id, userId: req.user?.uid });
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });
    res.json(pdf);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- QUIZ CONTROLLER ----------------
export const generateQuizFromPDF = async (req: Request, res: Response) => {
  try {
    const { pdfId, quizType, difficulty, questionCount, timeLimit, negativeMarking } = req.body;
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    const pdf = await PDF.findOne({ _id: pdfId, userId: firebaseUid });
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    // For simplicity, we regenerate from PDF summary or fetch full content. Since we saved summary, we can generate quiz based on summary if short,
    // or simulate using Gemini's knowledge of the pdf content. Let's send the PDF summary as context.
    const context = pdf.summary || 'General educational topics';

    const questions = await generateQuiz(context, quizType || 'mcq', difficulty || 'medium', questionCount || 5);

    const quiz = new Quiz({
      userId: firebaseUid,
      pdfId,
      title: `${pdf.title.replace('.pdf', '')} ${quizType.toUpperCase()} Quiz`,
      difficulty: difficulty || 'medium',
      quizType: quizType || 'mcq',
      questions,
      timeLimit: timeLimit || 10,
      negativeMarking: negativeMarking || false,
    });

    await quiz.save();

    // Create Notification
    await new Notification({
      userId: firebaseUid,
      title: 'Quiz Ready!',
      message: `Interactive quiz "${quiz.title}" has been successfully generated.`,
      type: 'success',
    }).save();

    res.json(quiz);
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz via Gemini AI' });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getQuizDetails = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user?.uid });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(550).json({ error: 'Server error' });
  }
};

// ---------------- ATTEMPT CONTROLLER ----------------
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const { answers, score, accuracy, timeTaken } = req.body;
    const quizId = req.params.id;
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    const quiz = await Quiz.findOne({ _id: quizId, userId: firebaseUid });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const attempt = new Attempt({
      userId: firebaseUid,
      quizId,
      score,
      accuracy,
      timeTaken,
      answers,
    });

    await attempt.save();

    // Trigger Analytics updating background
    await updateAnalytics(firebaseUid, score, timeTaken);

    // Notification of result
    await new Notification({
      userId: firebaseUid,
      title: 'Quiz Attempt Logged',
      message: `You scored ${score}% on "${quiz.title}". Keep it up!`,
      type: 'info',
    }).save();

    res.json(attempt);
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ error: 'Server error saving attempt' });
  }
};

export const getAttempts = async (req: Request, res: Response) => {
  try {
    const attempts = await Attempt.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- FLASHCARD & SUMMARY CONTROLLER ----------------
export const getFlashcardsByPDF = async (req: Request, res: Response) => {
  try {
    const flashcards = await Flashcard.find({ pdfId: req.params.pdfId, userId: req.user?.uid });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSummariesByPDF = async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findOne({ pdfId: req.params.pdfId, userId: req.user?.uid });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- BOOKMARKS CONTROLLER ----------------
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const { quizId, type } = req.body;
    const bookmark = new Bookmark({
      userId: req.user?.uid,
      quizId,
      type: type || 'quiz',
    });
    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeBookmark = async (req: Request, res: Response) => {
  try {
    await Bookmark.deleteOne({ quizId: req.params.quizId, userId: req.user?.uid });
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- NOTIFICATIONS CONTROLLER ----------------
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.user?.uid }, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const clearAllPDFs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    await PDF.deleteMany({ userId });
    await Summary.deleteMany({ userId });
    await Flashcard.deleteMany({ userId });
    res.json({ message: 'All PDFs, summaries, and flashcards cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear documents.' });
  }
};

export const clearAllQuizzes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    await Quiz.deleteMany({ userId });
    await Attempt.deleteMany({ userId });
    res.json({ message: 'All quizzes and attempts cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear quizzes.' });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    await Notification.deleteMany({ userId });
    res.json({ message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
};
