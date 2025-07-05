'use client'

import { useEffect, useState } from 'react'

interface PreloaderProps {
  duration?: number
  showProgress?: boolean
}

export function Preloader({ duration = 2000, showProgress = true }: PreloaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 300)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    // Fallback to ensure preloader disappears
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setIsLoading(false), 300)
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [duration])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-opacity duration-500">
      <div className="text-center animate-fade-in">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-blue-200 dark:border-gray-600 rounded-full animate-spin-slow" />
            <div className="absolute inset-2 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-slide-up">
            Loading
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 animate-slide-up-delay">
            Preparing your experience...
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden animate-fade-in-delay">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {showProgress && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-fade-in-delay">
            {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  )
}

// Simple spinner component for inline loading
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin ${className}`} />
  )
}

// Pulse loading animation
export function PulseLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  )
}

// Skeleton loader for content
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-300 dark:bg-gray-700 rounded" />
    </div>
  )
}