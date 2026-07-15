import mongoose, { Schema, Document } from 'mongoose';

// ---------------- USER SCHEMA ----------------
export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    provider: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

// ---------------- PDF SCHEMA ----------------
export interface IPDF extends Document {
  userId: string;
  title: string;
  fileUrl?: string;  // no longer storing files — kept optional for backward compat
  summary?: string;
  totalPages: number;
  status: 'processing' | 'ready' | 'failed';
  createdAt: Date;
}

const PDFSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    fileUrl: { type: String },          // optional — not stored anymore
    summary: { type: String },
    totalPages: { type: Number, default: 0 },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  },
  { timestamps: true }
);

export const PDF = mongoose.model<IPDF>('PDF', PDFSchema);

// ---------------- QUIZ SCHEMA ----------------
export interface IQuestion {
  questionText: string;
  options?: string[]; // for MCQs
  correctAnswer: string; // Index of option for MCQ, "true"/"false" for T/F, or text for fill in the blank / short answer
  explanation?: string;
}

export interface IQuiz extends Document {
  userId: string;
  pdfId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  quizType: 'mcq' | 'extract_mcq' | 'true_false' | 'fill_in_the_blanks' | 'short_answer';
  questions: IQuestion[];
  timeLimit: number; // in minutes
  negativeMarking: boolean;
  createdAt: Date;
}

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
});

const QuizSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    pdfId: { type: String, default: null, index: true }, // nullable — OCR quizzes have no PDF
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    quizType: { type: String, enum: ['mcq', 'extract_mcq', 'true_false', 'fill_in_the_blanks', 'short_answer'], default: 'mcq' },
    questions: [QuestionSchema],
    timeLimit: { type: Number, default: 10 },
    negativeMarking: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

// ---------------- ATTEMPT SCHEMA ----------------
export interface IAttempt extends Document {
  userId: string;
  quizId: string;
  score: number;
  accuracy: number;
  timeTaken: number; // in seconds
  answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[];
  createdAt: Date;
}

const AttemptSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedAnswer: { type: String },
        isCorrect: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Attempt = mongoose.model<IAttempt>('Attempt', AttemptSchema);

// ---------------- ANALYTICS SCHEMA ----------------
export interface IAnalytics extends Document {
  userId: string;
  totalQuizzes: number;
  averageScore: number;
  studyTime: number; // in minutes
  streak: number;
  weakTopics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    weakTopics: [{ type: String }],
  },
  { timestamps: true }
);

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

// ---------------- FLASHCARD SCHEMA ----------------
export interface IFlashcard extends Document {
  userId: string;
  pdfId: string;
  question: string;
  answer: string;
  createdAt: Date;
}

const FlashcardSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    pdfId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);

// ---------------- SUMMARY SCHEMA ----------------
export interface ISummary extends Document {
  userId: string;
  pdfId: string;
  content: string;
  title: string;
  createdAt: Date;
}

const SummarySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    pdfId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export const Summary = mongoose.model<ISummary>('Summary', SummarySchema);

// ---------------- BOOKMARK SCHEMA ----------------
export interface IBookmark extends Document {
  userId: string;
  quizId: string;
  type: 'quiz' | 'flashcard' | 'summary';
  createdAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    type: { type: String, enum: ['quiz', 'flashcard', 'summary'], required: true },
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

// ---------------- NOTIFICATION SCHEMA ----------------
export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'alert'], default: 'info' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
