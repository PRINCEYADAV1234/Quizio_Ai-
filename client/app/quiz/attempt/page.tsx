import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Layout,
  Volume2,
  Copy,
  Sparkles,
  Terminal,
} from 'lucide-react'

interface Question {
  id: number
  type: 'mcq' | 'truefalse' | 'fill'
  text: string
  options?: string[]
  pdfExcerpt: string
  answered?: string
}

export default function QuizAttemptPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showIndicatorGrid, setShowIndicatorGrid] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())

  const questions: Question[] = [
    {
      id: 1,
      type: 'mcq',
      text: 'What is the primary function of mitochondria in eukaryotic cells?',
      options: [
        'Protein synthesis',
        'ATP production through cellular respiration',
        'Photosynthesis',
        'Cell division',
      ],
      pdfExcerpt:
        'Mitochondria are often called the "powerhouse of the cell" because they are responsible for the generation of energy in the form of ATP (adenosine triphosphate) through a process known as aerobic respiration.',
    },
    {
      id: 2,
      type: 'truefalse',
      text: 'Photosynthesis occurs in the mitochondria of plant cells.',
      options: ['True', 'False'],
      pdfExcerpt:
        'Photosynthesis takes place in the chloroplasts of plant cells, not the mitochondria. The chloroplasts contain the necessary pigments and structures.',
    },
    {
      id: 3,
      type: 'mcq',
      text: 'Which enzyme is responsible for unwinding the DNA double helix during replication?',
      options: ['DNA Polymerase', 'DNA Helicase', 'Ligase', 'Primase'],
      pdfExcerpt:
        'DNA Helicase is the enzyme that breaks the hydrogen bonds between base pairs, effectively unwinding the DNA double helix to allow access to the genetic code for replication.',
    },
    {
      id: 4,
      type: 'fill',
      text: 'The process by which organisms produce genetically identical offspring is called ______.',
      pdfExcerpt:
        'Asexual reproduction is the process by which organisms produce genetically identical offspring without the involvement of gametes or meiosis.',
    },
  ]

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const isTimeWarning = timeLeft < 120 && timeLeft > 0
  const question = questions[currentQuestion]

  const handleAnswerSelect = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value,
    })
  }

  const toggleMark = () => {
    const newMarked = new Set(markedQuestions)
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion)
    } else {
      newMarked.add(currentQuestion)
    }
    setMarkedQuestions(newMarked)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5f6] dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Session Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-zinc-950 font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold tracking-[-0.03em]">Recall Session</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Index progress</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{currentQuestion + 1} / {questions.length}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <div className="text-right">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Time left</span>
              <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Top Progress Slider Bar */}
        <div className="max-w-7xl mx-auto px-8 pb-3">
          <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Split Panel */}
      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex-1 flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Col: RAG Source Terminal Excerpt (Col 4) */}
          <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#0c0c0e] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2 text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              <span>rag_context_retrieval.sh</span>
            </div>
            
            {/* Inline Terminal code-block syntax style */}
            <div className="font-mono text-[10px] bg-zinc-50 dark:bg-[#121215]/50 border border-zinc-150 dark:border-zinc-850 p-4 rounded-lg space-y-2 text-zinc-650 dark:text-zinc-400 leading-relaxed overflow-x-auto">
              <div className="text-zinc-400 dark:text-zinc-500 font-bold">$ cat reference_segment.txt</div>
              <p>&quot;{question.pdfExcerpt}&quot;</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 font-bold text-xs">
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Output
              </Button>
              <Button size="sm" variant="outline">
                <Volume2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Right Col: Active Recall Card (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-8 shadow-sm space-y-8">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[9px] border border-amber-500/20">
                  Concept index {currentQuestion + 1}
                </span>
                <h2 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug mt-4">
                  {question.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {question.options ? (
                  question.options.map((option, idx) => {
                    const label = String.fromCharCode(65 + idx)
                    const isSelected = answers[currentQuestion] === option
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-150 ${
                          isSelected
                            ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/5'
                            : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-zinc-350 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs border ${
                              isSelected
                                ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm'
                                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            {label}
                          </div>
                          <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 tracking-tight">{option}</span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <input
                    type="text"
                    placeholder="Input response parameter..."
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="w-full p-4 bg-zinc-50 dark:bg-[#121215]/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                )}
              </div>
            </div>

            {/* Nav drawers */}
            <div className="rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#0c0c0e] p-5 shadow-sm flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="font-bold text-xs"
                >
                  Previous
                </Button>
                <Button
                  onClick={toggleMark}
                  variant={markedQuestions.has(currentQuestion) ? 'default' : 'outline'}
                  className="font-bold text-xs"
                >
                  <Flag className={`w-3.5 h-3.5 mr-1.5 ${markedQuestions.has(currentQuestion) ? 'fill-current' : ''}`} />
                  Mark Review
                </Button>
                <Button
                  onClick={() => setShowIndicatorGrid(true)}
                  variant="outline"
                  className="font-bold text-xs"
                >
                  Overview
                </Button>
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Link to="/quiz/results">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold text-xs shadow-md">
                    Finish & Analyze
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold text-xs"
                >
                  Next Concept
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Indicator overlay */}
      {showIndicatorGrid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-850 rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm tracking-tight">Concept Overview</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentQuestion
                const isAnswered = answers[idx] !== undefined
                const isMarked = markedQuestions.has(idx)
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQuestion(idx)
                      setShowIndicatorGrid(false)
                    }}
                    className={`aspect-square rounded-lg border font-bold text-xs transition-all ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                        : isAnswered
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : isMarked
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <Button
              onClick={() => setShowIndicatorGrid(false)}
              className="w-full justify-center font-bold text-xs"
            >
              Resume Session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
