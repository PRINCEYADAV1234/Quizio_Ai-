import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Clear All',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md p-6 bg-white dark:bg-[#0c0c0e]/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-10 space-y-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon + Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 dark:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-black text-lg text-zinc-850 dark:text-zinc-100">
                {title}
              </h3>
            </div>

            {/* Message */}
            <p className="text-xs font-semibold leading-relaxed text-zinc-500 dark:text-zinc-400">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="text-xs font-bold text-zinc-550 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-lg text-xs"
              >
                {loading ? 'Clearing...' : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
