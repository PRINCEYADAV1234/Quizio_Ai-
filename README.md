# Quizio AI - AI-Powered Active Recall and Quiz Generation System

Quizio AI is a state-of-the-art web application designed to optimize learning parameters using active recall and automated content synthesis. By utilizing Google's Gemini models and Cloudinary document processing, Quizio AI extracts structured concepts, generates dynamic quizzes (MCQs, True/False, Blank Fills, Short Answers), and produces interactive flashcard decks and executive summaries.

---
    
##  Key Features

* **Intelligent PDF Sync:** Upload articles, slides, or notes. If Cloudinary is configured, files are automatically synced online; otherwise, local files fallback ensures zero execution breaks.
* **Structured Concept Extraction:** Extracts raw MCQs directly from uploaded PDFs or synthesizes new ones based on text analysis.
* **Recall Modules:** Generate Multiple Choice (MCQs), True / False validations, Cloze Deletion (Fill in the blanks), or Short Answer study cards.
* **Interactive Flashcards:** Flashcard study decks with flip transitions to self-test concepts.
* **AI Executive Summaries:** Beautifully structured markdown summaries highlighting key terminology and definitions.
* **Recall Analytics:** Numerical and percentage logs tracking historical study time, daily streak, and accuracy metrics.
* **Clear All Utilities:** Amber clear buttons that instantly reset data libraries on demand.

---

## 🛠️ Technology Stack

### Frontend
* **Core:** React, Vite, TypeScript
* **Styling:** Vanilla CSS, TailwindCSS utilities
* **Routing & State:** React Router DOM, Zustand (for persistent auth status)
* **Animation:** Framer Motion, Lucide icons, Recharts (for analytics trend curves)

### Backend
* **Core Runtime:** Node.js, Express, TypeScript
* **Database:** MongoDB Atlas, Mongoose ODM
* **AI Orchestration:** Google Generative AI SDK (`gemini-3.5-flash`)
* **Storage:** Cloudinary API, Multer (local disk upload fallback)
* **Auth:** Firebase Admin SDK (JWT token verification)

---

##  Folder Structure

```
quiz-genius-ai/
├── client/                     # React Frontend Application
│   ├── app/                    # Application Router / Pages
│   │   ├── dashboard/          # Student Dashboard Workspace
│   │   │   └── subpages.tsx    # Core Subpages (Library, Quizzes, Flashcards)
│   │   ├── login/              # Login Entry Portal
│   │   └── page.tsx            # Landing Page with smooth scrolling
│   ├── components/             # Reusable UI Elements (Sidebar, Layouts)
│   ├── lib/                    # Axios API client, Zustand Auth stores
│   └── public/                 # Favicon assets
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # DB Connection, Gemini SDK, Cloudinary
│   │   ├── controllers/        # Sync, Quizzes, PDFs, Attempts Controllers
│   │   ├── middleware/         # Auth verification headers middleware
│   │   ├── models/             # Mongoose schemas (User, PDF, Quiz, Attempt)
│   │   └── index.ts            # REST Route Definitions & Express server
```

---

##  Installation & Local Run

### Prerequisites
* Node.js (v18+)
* MongoDB database instances (local or Atlas)

### Step 1: Clone and Install dependencies
```bash
# Clone the repository
cd quiz-genius-ai

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 2: Run Development Servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend dev server (from client directory)
npm run dev
```

---

##  What I Learned

* **Model Optimization & Prompt Design:** Structuring Gemini model prompt instructions to output rigid JSON conforming to Mongoose schemas.
* **Failover Fallbacks:** Developing robust Multer/Express fallbacks to guarantee PDF upload workflows succeed locally even during Cloudinary API interruptions.
* **Component Optimization:** Creating a lightweight recursive parser for structured markdown renderings directly in React instead of bloating packages.
* **Real-time Synchronization:** Managing Firebase Auth status lifecycle synced seamlessly with MongoDB collections via Express middleware hooks.

---