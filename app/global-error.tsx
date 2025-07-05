'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 mb-4">
              500
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Global Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              A critical error occurred. Please refresh the page or contact support.
            </p>
            <div className="space-x-4">
              <button 
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}