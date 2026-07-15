import { Request, Response } from 'express';
import { User, PDF, Quiz, Attempt, Analytics, Flashcard, Bookmark, Notification } from '../models/Schemas';
import { generateQuiz, generateFlashcards, generateQuizFromImage } from '../config/gemini';
import pdfParse from 'pdf-parse';
import fs from 'fs';

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
    analytics.totalQuizzes = totalQuizzes;
    analytics.averageScore = Math.round(scoresSum / totalQuizzes);
    analytics.studyTime += Math.ceil(timeTakenSeconds / 60);
    analytics.streak = (analytics.streak || 0) + 1;
    await analytics.save();
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

/**
 * Parse PDF text from temp file and immediately delete it.
 * Returns the extracted text and page count.
 */
async function parsePDFAndCleanup(filePath: string): Promise<{ text: string; totalPages: number }> {
  let fileBuffer: Buffer;
  try {
    fileBuffer = fs.readFileSync(filePath);
  } catch (readErr) {
    throw new Error(`Could not read uploaded file: ${readErr}`);
  }

  let parsed: any;
  try {
    parsed = await pdfParse(fileBuffer);
  } catch (parseErr) {
    throw new Error(`PDF parsing failed: ${parseErr}`);
  } finally {
    // Delete temp file no matter what
    try { fs.unlinkSync(filePath); } catch (_) {}
  }

  const text = (parsed?.text || '').trim();
  if (!text) {
    throw new Error('PDF appears to be empty or contains only scanned images (no extractable text).');
  }

  // Debug: show which PDF was parsed and how much text was found
  console.log(`[PDF Parse] File: ${filePath}`);
  console.log(`[PDF Parse] Pages: ${parsed.numpages}, Text length: ${text.length} chars`);
  console.log(`[PDF Parse] Text preview (first 200 chars): ${text.substring(0, 200)}`);

  return { text, totalPages: parsed.numpages || 1 };
}

// ---------------- USER CONTROLLER ----------------
export const syncUser = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar, provider } = req.body;
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(400).json({ error: 'Missing firebaseUid' });

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, name: name || 'Quizio Scholar', email, avatar, provider: provider || 'email' });
      await user.save();
      await new Analytics({ userId: firebaseUid }).save();
      await new Notification({
        userId: firebaseUid,
        title: 'Welcome to Quizio!',
        message: 'Upload your first PDF to generate quizzes and flashcards.',
        type: 'success',
      }).save();
    } else {
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
      totalQuizzes: 0, averageScore: 0, studyTime: 0, streak: 0, weakTopics: [],
    };
    res.json({ user, analytics });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ---------------- PDF CONTROLLER ----------------

/**
 * Upload PDF → parse text from THIS file → generate flashcards → delete file → save records.
 * No summary. No Cloudinary. No file storage.
 */
export const uploadPDF = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    // 1. Parse PDF text from the FRESHLY uploaded file, then delete it
    let textContent: string;
    let totalPages: number;
    try {
      ({ text: textContent, totalPages } = await parsePDFAndCleanup(req.file.path));
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return res.status(400).json({ error: parseError?.message || 'Failed to read content from PDF file.' });
    }

    // 2. Save PDF record (no fileUrl — file is gone)
    const pdf = new PDF({
      userId: firebaseUid,
      title: req.file.originalname,
      totalPages,
      status: 'processing',
    });

    // 3. Generate flashcards from the FRESH text
    let flashcardsData: any[] = [];
    try {
      flashcardsData = await generateFlashcards(textContent, 6);
      console.log(`[Gemini] Generated ${flashcardsData.length} flashcards for "${req.file.originalname}"`);
    } catch (aiErr: any) {
      console.error('[Gemini] generateFlashcards failed:', aiErr?.message || aiErr);
      // Non-fatal: continue without flashcards
    }

    pdf.status = 'ready';
    await pdf.save();

    for (const fc of flashcardsData) {
      await new Flashcard({
        userId: firebaseUid,
        pdfId: pdf._id,
        question: fc.question,
        answer: fc.answer,
      }).save();
    }

    await new Notification({
      userId: firebaseUid,
      title: 'PDF Uploaded & Analyzed',
      message: `"${pdf.title}" processed. ${flashcardsData.length} flashcards ready.`,
      type: 'success',
    }).save();

    res.json({ pdf, flashcardCount: flashcardsData.length });
  } catch (error: any) {
    console.error('Upload PDF error:', error);
    res.status(500).json({ error: error?.message || 'Failed to upload and analyze PDF' });
  }
};

/**
 * Upload PDF → parse text from THIS file → generate flashcards + quiz → delete file → save records.
 * This is the MAIN flow. Quiz always comes from the uploaded PDF's text.
 */
export const uploadPDFAndGenerateQuiz = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const { quizType, difficulty, questionCount, timeLimit, negativeMarking } = req.body;

    // 1. Parse text from the FRESHLY uploaded file, delete immediately
    let textContent: string;
    let totalPages: number;
    try {
      ({ text: textContent, totalPages } = await parsePDFAndCleanup(req.file.path));
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return res.status(400).json({ error: parseError?.message || 'Failed to read content from PDF file.' });
    }

    console.log(`[Upload+Quiz] Using ${textContent.length} chars from "${req.file.originalname}" for quiz generation`);

    // 2. Save PDF record
    const pdf = new PDF({
      userId: firebaseUid,
      title: req.file.originalname,
      totalPages,
      status: 'processing',
    });

    // 3. Generate flashcards and quiz in parallel (drastically reduces response time)
    const qCount = Number(questionCount) || 5;
    let flashcardsData: any[] = [];
    let questions: any[] = [];

    console.log(`[Gemini] Starting parallel generation for quiz and flashcards...`);
    try {
      const [fcResult, quizResult] = await Promise.all([
        generateFlashcards(textContent, 6).catch(err => {
          console.error('[Gemini] generateFlashcards failed:', err?.message || err);
          return []; // fallback to empty array so quiz still succeeds
        }),
        generateQuiz(textContent, quizType || 'mcq', difficulty || 'medium', qCount)
      ]);
      flashcardsData = fcResult;
      questions = quizResult;
      console.log(`[Gemini] Parallel generation complete. Flashcards: ${flashcardsData.length}, Questions: ${questions.length}`);
    } catch (aiErr: any) {
      console.error('[Gemini] Parallel quiz generation failed:', aiErr?.message || aiErr);
      return res.status(502).json({ error: `Gemini AI error: ${aiErr?.message || 'Failed to generate quiz.'}` });
    }

    pdf.status = 'ready';
    await pdf.save();

    for (const fc of flashcardsData) {
      await new Flashcard({
        userId: firebaseUid,
        pdfId: pdf._id,
        question: fc.question,
        answer: fc.answer,
      }).save();
    }

    const quiz = new Quiz({
      userId: firebaseUid,
      pdfId: pdf._id,
      title: `${pdf.title.replace(/\.pdf$/i, '')} — ${(quizType || 'mcq').toUpperCase()} Quiz`,
      difficulty: difficulty || 'medium',
      quizType: quizType || 'mcq',
      questions,
      timeLimit: Number(timeLimit) || 10,
      negativeMarking: negativeMarking === 'true' || negativeMarking === true,
    });
    await quiz.save();

    await new Notification({
      userId: firebaseUid,
      title: 'PDF Uploaded & Quiz Ready!',
      message: `"${pdf.title}" analyzed. Quiz "${quiz.title}" is ready.`,
      type: 'success',
    }).save();

    res.json({ pdf, quiz });
  } catch (error: any) {
    console.error('Upload and generate quiz error:', error);
    res.status(500).json({ error: error?.message || 'Failed to upload PDF and generate quiz.' });
  }
};

export const getPDFs = async (req: Request, res: Response) => {
  try {
    const pdfs = await PDF.find({ userId: req.user?.uid }).sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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

/**
 * Re-generate quiz from an already-uploaded PDF's flashcard/stored data.
 * Since we don't store the file, we use flashcard text as context.
 */
export const generateQuizFromPDF = async (req: Request, res: Response) => {
  try {
    const { pdfId, quizType, difficulty, questionCount, timeLimit, negativeMarking } = req.body;
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });

    const pdf = await PDF.findOne({ _id: pdfId, userId: firebaseUid });
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    // Build context from stored flashcards (best approximation without original file)
    const flashcards = await Flashcard.find({ pdfId, userId: firebaseUid });
    let context = '';
    if (flashcards.length > 0) {
      context = flashcards.map(fc => `Q: ${fc.question}\nA: ${fc.answer}`).join('\n\n');
      console.log(`[ReGenQuiz] Using ${flashcards.length} flashcards as context for "${pdf.title}"`);
    } else {
      context = `Generate a quiz about the topic: ${pdf.title}`;
      console.log(`[ReGenQuiz] No flashcards found, using title as context`);
    }

    let questions: any[];
    try {
      questions = await generateQuiz(context, quizType || 'mcq', difficulty || 'medium', questionCount || 5);
    } catch (aiErr: any) {
      console.error('[Gemini] generateQuiz failed:', aiErr?.message || aiErr);
      return res.status(502).json({ error: `Gemini AI error: ${aiErr?.message || 'Failed to generate quiz.'}` });
    }

    const quiz = new Quiz({
      userId: firebaseUid,
      pdfId,
      title: `${pdf.title.replace(/\.pdf$/i, '')} — ${(quizType || 'mcq').toUpperCase()} Quiz`,
      difficulty: difficulty || 'medium',
      quizType: quizType || 'mcq',
      questions,
      timeLimit: timeLimit || 10,
      negativeMarking: negativeMarking || false,
    });
    await quiz.save();

    await new Notification({
      userId: firebaseUid,
      title: 'Quiz Ready!',
      message: `Quiz "${quiz.title}" has been generated.`,
      type: 'success',
    }).save();

    res.json({ ...quiz.toObject() });
  } catch (error: any) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate quiz' });
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
    res.status(500).json({ error: 'Server error' });
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

    const attempt = new Attempt({ userId: firebaseUid, quizId, score, accuracy, timeTaken, answers });
    await attempt.save();
    await updateAnalytics(firebaseUid, score, timeTaken);

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

// ---------------- FLASHCARD CONTROLLER ----------------
export const getFlashcardsByPDF = async (req: Request, res: Response) => {
  try {
    const flashcards = await Flashcard.find({ pdfId: req.params.pdfId, userId: req.user?.uid });
    res.json(flashcards);
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
    const bookmark = new Bookmark({ userId: req.user?.uid, quizId, type: type || 'quiz' });
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
    await Flashcard.deleteMany({ userId });
    res.json({ message: 'All PDFs and flashcards cleared.' });
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

// ---------------- OCR IMAGE → QUIZ CONTROLLER ----------------
export const generateQuizFromImageOCR = async (req: Request, res: Response) => {
  try {
    const firebaseUid = req.user?.uid;
    if (!firebaseUid) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const { quizType, questionCount } = req.body;
    const qCount = Number(questionCount) || 5;

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp';
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    let questions: any[];
    try {
      questions = await generateQuizFromImage(imageBase64, mimeType, quizType || 'mcq', qCount);
    } catch (aiErr: any) {
      console.error('[Gemini OCR] generateQuizFromImage failed:', aiErr?.message || aiErr);
      return res.status(502).json({ error: `Gemini AI OCR error: ${aiErr?.message || 'Failed to process image.'}` });
    }

    const quiz = new Quiz({
      userId: firebaseUid,
      pdfId: null,
      title: `OCR Quiz from Image (${(quizType || 'mcq').toUpperCase()})`,
      difficulty: 'medium',
      quizType: quizType || 'mcq',
      questions,
      timeLimit: 10,
      negativeMarking: false,
    });
    await quiz.save();

    await new Notification({
      userId: firebaseUid,
      title: 'OCR Quiz Ready!',
      message: 'Quiz generated from your image is ready.',
      type: 'success',
    }).save();

    res.json({ quiz });
  } catch (error: any) {
    console.error('OCR quiz generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate quiz from image.' });
  }
};
