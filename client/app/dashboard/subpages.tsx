import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileText, Upload, Brain, HelpCircle, BookOpen, BarChart3,
  Bookmark as BookmarkIcon, Bell, Settings, Award, Clock, ArrowRight,
  ChevronRight, RefreshCw, CheckCircle, AlertCircle, Plus, Play, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ==========================================
// 1. PDF LIBRARY PAGE
// ==========================================
export function PDFsPage() {
  const [pdfs, setPdfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/pdfs')
      .then(res => setPdfs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all PDFs, summaries, and flashcards?")) return
    try {
      await api.delete('/api/pdfs')
      setPdfs([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">Your PDF Library</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Store notes, slides and research papers</p>
        </div>
        <div className="flex gap-3">
          {pdfs.length > 0 && (
            <Button onClick={handleClearAll} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-2">
              Clear All
            </Button>
          )}
          <Link to="/dashboard/pdfs/upload">
            <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload PDF
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-550 font-mono">Loading your documents...</div>
      ) : pdfs.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="font-bold">No PDFs uploaded yet</p>
          <p className="text-xs text-zinc-400 mt-1">Upload study material to begin quiz generation</p>
          <Link to="/dashboard/pdfs/upload" className="inline-block mt-4">
            <Button variant="outline">Upload First File</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="p-6 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl shadow-sm hover:border-amber-500/50 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{pdf.title}</h3>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">
                  Pages: {pdf.totalPages}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between">
                <Link to={`/dashboard/pdfs/${pdf._id}`}>
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-amber-500 hover:text-amber-600">
                    View Details
                  </Button>
                </Link>
                <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. PDF UPLOAD PAGE
// ==========================================
export function PDFUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorText, setErrorText] = useState('')
  
  // Quiz configuration states
  const [quizType, setQuizType] = useState('mcq')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(10)
  
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setErrorText('')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    if (questionCount <= 3) {
      alert('Question count must be greater than 3.')
      return
    }
    if (timeLimit < 2) {
      alert('Time limit must be 2 minutes or greater.')
      return
    }

    setUploading(true)
    setErrorText('')

    // Step 1: Uploading file
    setProgress(10)
    setStatusText('Uploading PDF...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('quizType', quizType)
    formData.append('difficulty', difficulty)
    formData.append('questionCount', String(questionCount))
    formData.append('timeLimit', String(timeLimit))
    formData.append('negativeMarking', 'false')

    // Step 2: Parsing text — update UI while request is in-flight
    const stepTimer = setTimeout(() => {
      setProgress(30)
      setStatusText('Parsing PDF text content...')
    }, 1500)

    const summaryTimer = setTimeout(() => {
      setProgress(55)
      setStatusText('Generating AI summary & flashcards with Gemini 1.5 Flash...')
    }, 4000)

    const quizTimer = setTimeout(() => {
      setProgress(80)
      setStatusText('Synthesizing quiz questions...')
    }, 10000)

    try {
      const res = await api.post('/api/pdfs/upload-and-generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      })

      clearTimeout(stepTimer)
      clearTimeout(summaryTimer)
      clearTimeout(quizTimer)

      setProgress(100)
      setStatusText('Quiz generated successfully! Redirecting...')

      const generatedQuiz = res.data.quiz
      setTimeout(() => {
        navigate(`/dashboard/quizzes/${generatedQuiz._id}`)
      }, 1200)
    } catch (err: any) {
      clearTimeout(stepTimer)
      clearTimeout(summaryTimer)
      clearTimeout(quizTimer)

      console.error(err)
      setProgress(0)
      setUploading(false)

      // Show the actual server error message to the user
      const serverError = err?.response?.data?.error
      setErrorText(serverError || 'Failed to upload PDF and generate quiz. Please try again.')
      setStatusText('')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {errorText && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/80 text-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-xs uppercase tracking-wider">Error</p>
            <p className="text-xs mt-1">{errorText}</p>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Upload PDF & Generate Quiz</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">AI parses your layout outline, extracts text, and builds custom quizzes</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-xl p-8 text-center cursor-pointer transition">
            <input
              type="file"
              accept=".pdf"
              id="pdf-file"
              required
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-file" className="cursor-pointer block space-y-3">
              <Upload className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200">
                {file ? file.name : 'Choose PDF file or drag it here'}
              </p>
              <p className="text-xs text-zinc-400">Supports large textbooks and documents</p>
            </label>
          </div>

          {file && (
            <div className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Customize Quiz Settings</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Quiz Type</label>
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="extract_mcq">Extract PDFs MCQs</option>
                    <option value="true_false">True / False</option>
                    <option value="fill_in_the_blanks">Fill in Blanks</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Difficulty</label>
                  <select
                    value={difficulty}
                    disabled={quizType === 'extract_mcq'}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Question Count {quizType !== 'extract_mcq' && '(> 3)'}</label>
                  <input
                    type="number"
                    min="4"
                    disabled={quizType === 'extract_mcq'}
                    value={quizType === 'extract_mcq' ? '' : (questionCount === 0 ? '' : questionCount)}
                    onChange={(e) => setQuestionCount(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                    placeholder={quizType === 'extract_mcq' ? 'Auto-detect' : ''}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Time Limit (mins ≥ 2)</label>
                  <input
                    type="number"
                    min="2"
                    value={timeLimit === 0 ? '' : timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {quizType === 'extract_mcq' && (
                  <p className="text-[9px] text-amber-500 font-extrabold col-span-2 tracking-wide uppercase mt-1">
                    Notice: Extraction mode will pull all raw MCQs from your PDF. Question Count & Difficulty inputs are disabled.
                  </p>
                )}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              {/* Step indicators synced to real processing stages */}
              <div className="space-y-1.5">
                {[
                  { label: 'Uploading PDF', done: progress >= 10 },
                  { label: 'Parsing text content', done: progress >= 30 },
                  { label: 'Generating AI summary & flashcards', done: progress >= 55 },
                  { label: 'Synthesizing quiz questions', done: progress >= 80 },
                  { label: 'Saving to database', done: progress >= 100 },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold transition-all ${
                      step.done
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </span>
                    <span className={`text-[10px] font-semibold transition-colors ${
                      step.done ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                {statusText}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold h-11 rounded-xl"
          >
            {uploading ? 'Synthesizing with AI...' : 'Upload & Generate Quiz'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// Helper to parse basic markdown format safely
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let content = line.trim();
    if (!content) return <div key={idx} className="h-2" />;

    // Headers
    if (content.startsWith('### ')) {
      return <h4 key={idx} className="text-sm font-bold text-amber-500 mt-4 mb-2">{content.replace('### ', '')}</h4>;
    }
    if (content.startsWith('## ')) {
      return <h3 key={idx} className="text-base font-black text-zinc-800 dark:text-zinc-100 mt-5 mb-2">{content.replace('## ', '')}</h3>;
    }
    if (content.startsWith('# ')) {
      return <h2 key={idx} className="text-lg font-black text-zinc-850 dark:text-zinc-50 mt-6 mb-3">{content.replace('# ', '')}</h2>;
    }

    // Bullet Points
    const isBullet = content.startsWith('- ') || content.startsWith('* ');
    if (isBullet) {
      content = content.substring(2);
    }

    // Parse bold (**text**) and italic (*text*)
    const parts = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      const matchStr = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }

      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        parts.push(<strong key={matchIndex} className="font-extrabold text-amber-500 dark:text-amber-400">{matchStr.slice(2, -2)}</strong>);
      } else if (matchStr.startsWith('*') && matchStr.endsWith('*')) {
        parts.push(<em key={matchIndex} className="italic text-zinc-800 dark:text-zinc-200">{matchStr.slice(1, -1)}</em>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <li key={idx} className="ml-4 list-disc text-xs text-zinc-650 dark:text-zinc-355 leading-relaxed py-0.5 font-medium">
          {parts.length > 0 ? parts : content}
        </li>
      );
    }

    return (
      <p key={idx} className="text-xs text-zinc-650 dark:text-zinc-355 leading-relaxed font-medium">
        {parts.length > 0 ? parts : content}
      </p>
    );
  });
}

// ==========================================
// 3. PDF DETAILS PAGE
// ==========================================
export function PDFDetailsPage() {
  const { id } = useParams()
  const [pdf, setPdf] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/pdfs/${id}`)
      .then(res => setPdf(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center font-mono">Loading details...</div>
  if (!pdf) return <div className="text-center font-mono">PDF not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">{pdf.title}</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">AI analysis summary and study portals</p>
        </div>
        <Link to={`/dashboard/quizzes/create?pdfId=${pdf._id}`}>
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg">
            Generate Quiz
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-serif font-black text-lg text-zinc-800 dark:text-zinc-100 border-b pb-2 border-zinc-100 dark:border-zinc-850">
            Document Summary
          </h3>
          <div className="space-y-2">
            {pdf.summary ? renderMarkdown(pdf.summary) : 'Summary not found'}
          </div>
        </div>

        {/* Portals */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm">Study Portals</h4>
            <div className="space-y-3">
              <Link to={`/dashboard/flashcards/${pdf._id}`} className="block p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">Interactive Flashcards</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Revise core terminology</p>
                  </div>
                </div>
              </Link>
              <Link to={`/dashboard/summaries/${pdf._id}`} className="block p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">Comprehensive Summary</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Dedicated revision page</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. ALL QUIZZES PAGE
// ==========================================
export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/quizzes')
      .then(res => setQuizzes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all quizzes and attempts?")) return
    try {
      await api.delete('/api/quizzes')
      setQuizzes([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">AI Generated Quizzes</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Test your comprehension parameters</p>
        </div>
        <div className="flex gap-3">
          {quizzes.length > 0 && (
            <Button onClick={handleClearAll} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-2">
              Clear All
            </Button>
          )}
          <Link to="/dashboard/quizzes/create">
            <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Quiz
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-550 font-mono">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="font-bold">No quizzes generated yet</p>
          <p className="text-xs text-zinc-400 mt-1">Configure your first active recall parameters</p>
          <Link to="/dashboard/quizzes/create" className="inline-block mt-4">
            <Button variant="outline">Create a Quiz</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="p-6 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl shadow-sm hover:border-amber-500/50 transition duration-300 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {quiz.difficulty} • {quiz.quizType.replace('_', ' ')}
                </span>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 mt-2">{quiz.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">Questions: {quiz.questions?.length || 0} • {quiz.timeLimit} mins</p>
              </div>
              <Link to={`/dashboard/quizzes/${quiz._id}`}>
                <Button className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-100 rounded-lg p-2.5">
                  <Play className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. QUIZ CREATE PAGE
// ==========================================
export function QuizCreatePage() {
  const [searchParams] = useSearchParams()
  const queryPdfId = searchParams.get('pdfId') || ''
  
  const [pdfs, setPdfs] = useState<any[]>([])
  const [selectedPdfId, setSelectedPdfId] = useState(queryPdfId)
  const [quizType, setQuizType] = useState('mcq')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [timeLimit, setTimeLimit] = useState(10)
  const [negativeMarking, setNegativeMarking] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [geminiKeyError, setGeminiKeyError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/pdfs')
      .then(res => {
        setPdfs(res.data)
        if (!queryPdfId && res.data.length > 0) {
          setSelectedPdfId(res.data[0]._id)
        }
      })
      .catch(console.error)
  }, [queryPdfId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPdfId) return

    setGenerating(true)
    setGeminiKeyError(false)
    try {
      const res = await api.post('/api/quizzes/generate', {
        pdfId: selectedPdfId,
        quizType,
        difficulty,
        questionCount,
        timeLimit,
        negativeMarking,
      }, {
        timeout: 120000,
      })
      
      if (res.data.geminiKeyError) {
        setGeminiKeyError(true)
        setGenerating(false)
        setTimeout(() => {
          navigate(`/dashboard/quizzes/${res.data._id}`)
        }, 5000)
      } else {
        navigate(`/dashboard/quizzes/${res.data._id}`)
      }
    } catch (err) {
      console.error(err)
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {geminiKeyError && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950 text-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-xs uppercase tracking-wider">GEMINI API KEY NOT WORKING</p>
            <p className="text-xs mt-1">
              Your GEMINI_API_KEY environment variable is invalid or missing. The quiz was created using fallback mock questions.
            </p>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Configure Active Practice</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">AI synthesizes custom questions matching your choices</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-505 uppercase tracking-wider">Select Source Document</label>
            <select
              value={selectedPdfId}
              onChange={(e) => setSelectedPdfId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {pdfs.map(pdf => (
                <option key={pdf._id} value={pdf._id}>{pdf.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Quiz Type</label>
              <select
                value={quizType}
                onChange={(e) => setQuizType(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="extract_mcq">Extract PDFs MCQs</option>
                <option value="true_false">True / False</option>
                <option value="fill_in_the_blanks">Fill in Blanks</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                disabled={quizType === 'extract_mcq'}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none disabled:opacity-50"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Question Count {quizType !== 'extract_mcq' && '(&gt; 3)'}</label>
              <input
                type="number"
                min="4"
                disabled={quizType === 'extract_mcq'}
                value={quizType === 'extract_mcq' ? '' : (questionCount === 0 ? '' : questionCount)}
                onChange={(e) => setQuestionCount(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full p-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
                placeholder={quizType === 'extract_mcq' ? 'Auto-detect' : ''}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Time Limit (mins &ge; 2)</label>
              <input
                type="number"
                min="2"
                value={timeLimit === 0 ? '' : timeLimit}
                onChange={(e) => setTimeLimit(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full p-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-850 rounded-xl text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {quizType === 'extract_mcq' && (
              <p className="text-[10px] text-amber-500 font-extrabold col-span-2 tracking-wide uppercase mt-1">
                Notice: Extraction mode will pull all raw MCQs from your PDF. Question Count & Difficulty inputs are disabled.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={generating || pdfs.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold h-11 rounded-xl mt-4"
          >
            {generating ? 'Synthesizing with Gemini...' : 'Synthesize Quiz'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// 6. QUIZ DETAILS LANDING PAGE
// ==========================================
export function QuizDetailsPage() {
  const { id } = useParams()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/quizzes/${id}`)
      .then(res => setQuiz(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center font-mono py-12">Loading quiz info...</div>
  if (!quiz) return <div className="text-center font-mono py-12">Quiz not found</div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">{quiz.title}</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Practice Outline</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-150 dark:border-zinc-850">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Questions</span>
            <span className="text-xl font-black mt-1 block">{quiz.questions?.length}</span>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-150 dark:border-zinc-850">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timer</span>
            <span className="text-xl font-black mt-1 block">{quiz.timeLimit}m</span>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-150 dark:border-zinc-850">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Neg Marking</span>
            <span className="text-xs font-bold mt-2.5 block text-amber-500">{quiz.negativeMarking ? 'Active' : 'None'}</span>
          </div>
        </div>

        <Link to={`/dashboard/quizzes/${quiz._id}/start`}>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold h-11 rounded-xl flex justify-center items-center gap-2">
            Start Practice <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ==========================================
// 7. QUIZ PRACTICE / START RUNNING PAGE
// ==========================================
export function QuizStartPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [secondsRemaining, setSecondsRemaining] = useState(600)

  useEffect(() => {
    api.get(`/api/quizzes/${id}`)
      .then(res => {
        setQuiz(res.data)
        setAnswers(new Array(res.data.questions?.length || 0).fill(''))
        setSecondsRemaining(res.data.timeLimit * 60)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleSubmit()
      return
    }
    const interval = setInterval(() => {
      setSecondsRemaining(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsRemaining])

  const handleSelectOption = (optIdx: string) => {
    const updated = [...answers]
    updated[currentIdx] = optIdx
    setAnswers(updated)
  }

  const handleSubmit = async () => {
    if (!quiz) return
    let score = 0
    let correctCount = 0
    const processedAnswers = quiz.questions.map((q: any, i: number) => {
      const isCorrect = answers[i].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      if (isCorrect) correctCount++
      return {
        questionId: q._id || String(i),
        selectedAnswer: answers[i],
        isCorrect,
      }
    })

    score = Math.round((correctCount / quiz.questions.length) * 100)
    const accuracy = score
    const timeTaken = quiz.timeLimit * 60 - secondsRemaining

    try {
      const res = await api.post(`/api/quizzes/${quiz._id}/attempts`, {
        answers: processedAnswers,
        score,
        accuracy,
        timeTaken,
      })
      navigate(`/dashboard/quizzes/${quiz._id}/result`, { state: { attempt: res.data, quiz } })
    } catch (err) {
      console.error(err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (loading) return <div className="text-center font-mono py-12">Booting environment...</div>
  if (!quiz) return <div className="text-center font-mono py-12">Environment issue</div>

  const currentQuestion = quiz.questions[currentIdx]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
            Question {currentIdx + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-amber-500 font-mono text-sm">
          {formatTime(secondsRemaining)}
        </div>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-6">
        <p className="font-extrabold text-lg tracking-tight text-zinc-850 dark:text-zinc-150">
          {currentQuestion.questionText}
        </p>

        {/* Options for MCQ / True False */}
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt: string, i: number) => {
              const optStr = String(i)
              const selected = answers[currentIdx] === optStr
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(optStr)}
                  className={`w-full text-left p-4 rounded-xl border font-semibold transition text-sm ${
                    selected
                      ? 'border-amber-500 bg-amber-500/10 text-zinc-950 dark:text-amber-400'
                      : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-600 dark:text-zinc-350'
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          // Text Input for Fill in Blank / Short Answer
          <input
            type="text"
            placeholder="Type your answer here..."
            value={answers[currentIdx]}
            onChange={(e) => {
              const updated = [...answers]
              updated[currentIdx] = e.target.value
              setAnswers(updated)
            }}
            className="w-full p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        )}

        <div className="flex justify-between pt-4 border-t border-zinc-150 dark:border-zinc-850">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            Previous
          </Button>

          {currentIdx < quiz.questions.length - 1 ? (
            <Button
              className="bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold"
              onClick={() => setCurrentIdx(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold"
              onClick={handleSubmit}
            >
              Submit Exam
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 8. QUIZ RESULT PAGE
// ==========================================
export function QuizResultPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  // Try to retrieve state
  const [attempt, setAttempt] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)

  useEffect(() => {
    // If not supplied in state, navigate back
    if (history.state?.usr?.attempt) {
      setAttempt(history.state.usr.attempt)
      setQuiz(history.state.usr.quiz)
    } else {
      // Fallback: fetch from API
      api.get('/api/attempts/history').then(res => {
        const matching = res.data.find((a: any) => a.quizId === id)
        if (matching) {
          setAttempt(matching)
          api.get(`/api/quizzes/${id}`).then(q => setQuiz(q.data))
        }
      })
    }
  }, [id])

  if (!attempt || !quiz) {
    return <div className="text-center font-mono py-12">Extracting metrics...</div>
  }

  const correctCount = attempt.answers?.filter((a: any) => a.isCorrect).length || 0
  const totalCount = attempt.answers?.length || quiz.questions.length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-black tracking-tight text-zinc-850 dark:text-zinc-100">Performance Report</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">{quiz.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center flex flex-col justify-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Score</span>
          <span className="text-4xl font-black text-amber-500">{attempt.score}%</span>
          <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-1">({correctCount} / {totalCount} Correct)</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center flex flex-col justify-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Accuracy</span>
          <span className="text-4xl font-black text-emerald-500">{attempt.accuracy}%</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center flex flex-col justify-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Time Taken</span>
          <span className="text-4xl font-black">{Math.ceil(attempt.timeTaken / 60)}m</span>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
        <h3 className="font-bold text-sm">Question Analysis</h3>
        <div className="space-y-4">
          {quiz.questions.map((q: any, i: number) => {
            const userAns = attempt.answers?.[i] || { isCorrect: false, selectedAnswer: '' }
            return (
              <div key={i} className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{q.questionText}</p>
                  {userAns.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-550 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs space-y-1 font-semibold text-zinc-500">
                  <p>Your Answer: <span className={userAns.isCorrect ? 'text-emerald-500' : 'text-red-500'}>{userAns.selectedAnswer || 'None'}</span></p>
                  <p>Correct Answer: <span className="text-emerald-500">{q.correctAnswer}</span></p>
                </div>
                {q.explanation && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900 font-mono">
                    Explanation: {q.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Link to="/dashboard">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg px-6">
            Workspace Overview
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ==========================================
// 9. QUIZ HISTORY PAGE
// ==========================================
export function QuizHistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/attempts/history')
      .then(res => setAttempts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Practice History</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Review your recall progression</p>
      </div>

      {loading ? (
        <div className="text-center font-mono">Loading history...</div>
      ) : attempts.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">No attempts logged yet.</div>
      ) : (
        <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-850 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/20">
                <th className="p-4">Quiz</th>
                <th className="p-4">Score</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4">Time Taken</th>
                <th className="p-4">Attempted At</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-zinc-600 dark:text-zinc-350">
              {attempts.map((attempt) => (
                <tr key={attempt._id} className="border-b border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/10">
                  <td className="p-4 font-bold text-zinc-850 dark:text-zinc-200">Attempt {attempt._id.substring(18)}</td>
                  <td className="p-4 text-amber-500">{attempt.score}%</td>
                  <td className="p-4 text-emerald-500">{attempt.accuracy}%</td>
                  <td className="p-4">{Math.ceil(attempt.timeTaken / 60)} mins</td>
                  <td className="p-4">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 10. FLASHCARDS LIST PAGE
// ==========================================
export function FlashcardsPage() {
  const [pdfs, setPdfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/pdfs')
      .then(res => setPdfs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all flashcards?")) return
    try {
      await api.delete('/api/pdfs')
      setPdfs([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">Interactive Flashcards</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Choose a document to start revisions</p>
        </div>
        {pdfs.length > 0 && (
          <Button onClick={handleClearAll} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg">
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center font-mono">Loading decks...</div>
      ) : pdfs.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Upload a PDF to view flashcards.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="p-6 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl shadow-sm hover:border-amber-500/50 transition flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-850 dark:text-zinc-200">{pdf.title} Deck</h3>
                <p className="text-xs text-zinc-400 mt-1">Interactive active recall cards</p>
              </div>
              <Link to={`/dashboard/flashcards/${pdf._id}`}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg">
                  Study Deck
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 11. FLASHCARD STUDY (FLIPPING CARD) PAGE
// ==========================================
export function FlashcardsStudyPage() {
  const { id } = useParams()
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    api.get(`/api/flashcards/pdf/${id}`)
      .then(res => setFlashcards(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center font-mono py-12">Loading flashcards...</div>
  if (flashcards.length === 0) return <div className="text-center font-mono py-12">No flashcards found. Upload the PDF again.</div>

  const currentCard = flashcards[currentIdx]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif">Revision Deck</h2>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Card {currentIdx + 1} of {flashcards.length}
        </span>
      </div>

      {/* Card Container */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-full h-80 relative cursor-pointer group"
        style={{ perspective: '1000px' }}
      >
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl border transition-transform duration-500 bg-white dark:bg-[#0c0c0e] shadow-xl p-8 flex flex-col justify-center items-center text-center ${
            flipped ? 'rotate-y-180 border-amber-500' : 'border-zinc-200 dark:border-zinc-800'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card Front / Back contents */}
          {!flipped ? (
            <div className="space-y-4">
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Question</span>
              <p className="font-extrabold text-xl tracking-tight text-zinc-850 dark:text-zinc-150 leading-relaxed">
                {currentCard.question}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono italic mt-4">Click card to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-4" style={{ transform: 'rotateY(180deg)' }}>
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Answer</span>
              <p className="font-bold text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {currentCard.answer}
              </p>
              <p className="text-[10px] text-zinc-450 font-mono italic mt-4">Click card to show question</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          disabled={currentIdx === 0}
          onClick={() => {
            setCurrentIdx(prev => prev - 1)
            setFlipped(false)
          }}
          className="bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 font-bold rounded-lg"
        >
          Previous
        </Button>
        <Button
          disabled={currentIdx === flashcards.length - 1}
          onClick={() => {
            setCurrentIdx(prev => prev + 1)
            setFlipped(false)
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg disabled:opacity-50"
        >
          Next Card
        </Button>
      </div>
    </div>
  )
}

// ==========================================
// 12. SUMMARIES LIST PAGE
// ==========================================
export function SummariesPage() {
  const [pdfs, setPdfs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/pdfs')
      .then(res => setPdfs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all summaries?")) return
    try {
      await api.delete('/api/pdfs')
      setPdfs([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">AI PDF Summaries</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Select a document to read the executive summaries</p>
        </div>
        {pdfs.length > 0 && (
          <Button onClick={handleClearAll} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg">
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center font-mono">Loading summaries...</div>
      ) : pdfs.length === 0 ? (
        <div className="py-12 text-center text-zinc-550">Upload a PDF to view summaries.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="p-6 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl shadow-sm hover:border-amber-500/50 transition flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-850 dark:text-zinc-200">{pdf.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">Full summary & headings breakdown</p>
              </div>
              <Link to={`/dashboard/summaries/${pdf._id}`}>
                <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg">
                  Read Summary
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 13. SUMMARY DETAILS PAGE
// ==========================================
export function SummaryDetailsPage() {
  const { id } = useParams()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/summaries/pdf/${id}`)
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center font-mono py-12">Loading summary content...</div>
  if (!summary) return <div className="text-center font-mono py-12">Summary content not found. Upload the PDF again.</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">{summary.title}</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">AI Synced Executive Summary</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-3">
          {summary.content ? renderMarkdown(summary.content) : 'No content found'}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 14. ANALYTICS PAGE
// ==========================================
export function AnalyticsPage() {
  const { analytics } = useAuthStore()
  const [attempts, setAttempts] = useState<any[]>([])

  useEffect(() => {
    api.get('/api/attempts/history')
      .then(res => setAttempts(res.data))
      .catch(console.error)
  }, [])

  const graphData = attempts.map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.score,
  })).reverse()

  // Calculate total marks obtained (correct answers out of total questions across all attempts)
  let totalCorrectAnswers = 0;
  let totalQuestions = 0;
  attempts.forEach(a => {
    if (a.answers && a.answers.length > 0) {
      totalQuestions += a.answers.length;
      a.answers.forEach((ans: any) => {
        if (ans.isCorrect) totalCorrectAnswers++;
      });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Learning Analytics</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Performance metrics, strengths and suggestions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Quizzes</span>
          <span className="text-3xl font-black text-amber-500">{analytics?.totalQuizzes || 0}</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Average Score</span>
          <span className="text-3xl font-black text-emerald-500">{analytics?.averageScore || 0}%</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Marks</span>
          <span className="text-3xl font-black text-amber-600">{totalCorrectAnswers} / {totalQuestions}</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Study Time</span>
          <span className="text-3xl font-black">{analytics?.studyTime || 0} mins</span>
        </div>
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Daily Streak</span>
          <span className="text-3xl font-black text-amber-600">{analytics?.streak || 0} days 🔥</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm mb-4">Recall Trend Curve</h3>
          <div className="h-64">
            {graphData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">Complete quizzes to plot your trend curve.</div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm">AI Study Recommendations</h3>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold leading-relaxed text-amber-700 dark:text-amber-400 space-y-2">
            <Brain className="w-5 h-5 mb-1" />
            <p>Your recall rate is stabilizing at {analytics?.averageScore || 0}%.</p>
            <p>We recommend creating a new medium difficulty MCQ quiz from your recent documents to solidify memory links.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 15. PROFILE PAGE
// ==========================================
export function ProfilePage() {
  const { profile } = useAuthStore()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Your Profile</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Account parameters</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-6 flex flex-col items-center">
        {profile?.avatar ? (
          <img src={profile.avatar} alt="Profile" className="w-20 h-20 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-md" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center font-bold text-2xl text-zinc-950 font-serif shadow-md">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="w-full space-y-4 text-sm font-semibold">
          <div className="border-b pb-2">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest">Name</span>
            <span className="text-zinc-850 dark:text-zinc-200 mt-1 block">{profile?.name}</span>
          </div>
          <div className="border-b pb-2">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest">Email</span>
            <span className="text-zinc-850 dark:text-zinc-200 mt-1 block">{profile?.email}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest">Sign-In Provider</span>
            <span className="text-zinc-850 dark:text-zinc-200 mt-1 block capitalize">{profile?.provider}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 16. SETTINGS PAGE
// ==========================================
export function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Preferences</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Study and theme configuration</p>
      </div>

      <div className="p-8 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="font-bold text-sm">Appearance Settings</h3>
        <p className="text-xs text-zinc-400">Dark theme is enabled by default for maximum focus. Toggle the light or dark mode using the sidebar switch.</p>
      </div>
    </div>
  )
}

// ==========================================
// 17. BOOKMARKS PAGE
// ==========================================
export function BookmarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-black tracking-tight">Saved Bookmarks</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Fast-access recall cards</p>
      </div>
      <div className="p-8 text-center bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-550">
        You don&apos;t have any bookmarks saved yet. Click the bookmark icon during quizzes to save them here.
      </div>
    </div>
  )
}

// ==========================================
// 18. NOTIFICATIONS PAGE
// ==========================================
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    api.get('/api/notifications')
      .then(res => setNotifications(res.data))
      .catch(console.error)
  }, [])

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return
    try {
      await api.delete('/api/notifications')
      setNotifications([])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight">Notifications Feed</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Recent study events and system reports</p>
        </div>
        {notifications.length > 0 && (
          <Button onClick={handleClearAll} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg">
            Clear All
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif._id} className="p-5 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{notif.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">{notif.message}</p>
                <span className="text-[10px] text-zinc-400 mt-2 block font-mono">
                  {new Date(notif.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
