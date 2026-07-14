import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StreamingQuizGenerator } from '@/components/streaming-quiz-generator'
import { KnowledgeGraph3D } from '@/components/knowledge-graph-3d'
import { CanvasConceptMapper } from '@/components/canvas-concept-mapper'
import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, BarChart3, Lightbulb } from 'lucide-react'

export default function AdvancedPage() {
  const [activeTab, setActiveTab] = useState('generator')

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Sidebar userInitial="J" userName="John Doe" />

      {/* Main Workspace Container */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Top Header Blending Layout */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/60">
          <div className="px-8 py-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Advanced Analytics Studio</h1>
          </div>
        </header>

        {/* Workspace Wrap */}
        <main className="max-w-7xl w-full mx-auto px-8 py-10 space-y-8 flex-1">
          {/* Feature Bento Grid Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                icon: Zap,
                label: 'Streaming Models',
                desc: 'Real-time evaluations',
                color: 'from-amber-500 to-amber-600',
              },
              {
                icon: Brain,
                label: '3D Vector Graphs',
                desc: 'Interactive visual models',
                color: 'from-amber-500 to-amber-600',
              },
              {
                icon: BarChart3,
                label: 'Recall Analysis',
                desc: 'Spaced repetition logs',
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                icon: TrendingUp,
                label: 'Predictive Models',
                desc: 'AI accuracy forecasts',
                color: 'from-amber-550 to-amber-650',
              },
              {
                icon: Lightbulb,
                label: 'Concept Canvas',
                desc: 'Node connection maps',
                color: 'from-amber-500 to-amber-600',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] shadow-sm hover:border-amber-500/20 transition-all duration-300"
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 text-white dark:text-zinc-950`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 tracking-tight leading-none">{feature.label}</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1 font-semibold leading-tight">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl mb-8">
              <TabsTrigger
                value="generator"
                className="rounded-lg data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 transition font-bold text-xs"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                <span>Simulation Generator</span>
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="rounded-lg data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 transition font-bold text-xs"
              >
                <Brain className="w-4 h-4 mr-1.5" />
                <span>3D Knowledge Map</span>
              </TabsTrigger>
              <TabsTrigger
                value="mapper"
                className="rounded-lg data-[state=active]:bg-zinc-900 dark:data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:text-zinc-950 transition font-bold text-xs"
              >
                <Lightbulb className="w-4 h-4 mr-1.5" />
                <span>Active Concept Board</span>
              </TabsTrigger>
            </TabsList>

            {/* Generator Tab */}
            <TabsContent value="generator" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] p-8 shadow-sm"
              >
                <StreamingQuizGenerator />
              </motion.div>

              {/* Stats panel */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Generation Throughput',
                    metric: '2.3s',
                    subtext: 'average processing rate',
                    trend: '99th percentile',
                  },
                  {
                    title: 'Model Confidence',
                    metric: '94.2%',
                    subtext: 'across extracted tokens',
                    trend: 'Excellent calibration',
                  },
                  {
                    title: 'Token Optimization',
                    metric: '847 / gen',
                    subtext: 'reduced context overhead',
                    trend: 'Highly efficient',
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] shadow-sm"
                  >
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-2 tracking-tight">{stat.metric}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">{stat.subtext}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{stat.trend}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Knowledge Graph Tab */}
            <TabsContent value="knowledge" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-sm overflow-hidden"
              >
                <KnowledgeGraph3D />
              </motion.div>

              {/* Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] shadow-sm"
                >
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Active Discrepancy Gaps</h3>
                  <ul className="space-y-3 font-semibold text-xs text-zinc-650 dark:text-zinc-400">
                    {[
                      'CO2 Fixation Pathway (44% accuracy) - Recall gaps flagged',
                      'Light Reactions Overview (42%) - Core prerequisite topic',
                      'Glycolytic Cycle (54%) - Suboptimal recall strength',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-xl border border-zinc-200 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] shadow-sm"
                >
                  <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Targeted Milestones</h3>
                  <div className="space-y-3">
                    {[
                      { step: 1, label: 'Master Light Pathways', status: 'Active Focus', percent: 65 },
                      { step: 2, label: 'Calvin Loop Concepts', status: 'Next', percent: 0 },
                      { step: 3, label: 'Concept Synthesis', status: 'Locked', percent: 0 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-zinc-700 dark:text-zinc-350">
                            {item.step}. {item.label}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              item.status === 'Active Focus'
                                ? 'bg-amber-100 border-amber-250 text-amber-850 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                                : item.status === 'Next'
                                  ? 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-400'
                                  : 'bg-zinc-50 border-zinc-150 text-zinc-400 dark:bg-zinc-900/40 dark:border-zinc-900/60 dark:text-zinc-650'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        {item.percent > 0 && (
                          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/20 dark:border-zinc-800/40">
                            <div
                              className="h-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Concept Board */}
            <TabsContent value="mapper" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 shadow-sm"
              >
                <CanvasConceptMapper />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
