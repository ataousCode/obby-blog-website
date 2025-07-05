'use client'

import { Suspense, lazy, ComponentType, useState, useEffect, useRef } from 'react'
import { Loading } from './loading'

interface LazyWrapperProps {
  fallback?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function LazyWrapper({ 
  fallback = <Loading variant="card" />, 
  className,
  children 
}: LazyWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }))
  
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <Loading variant="card" />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

// Utility for creating lazy-loaded components
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <Loading variant="card" />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])
  
  return isIntersecting
}

// Component for lazy loading content when it comes into view
export function LazyOnScroll({ 
  children, 
  fallback = <Loading variant="card" />,
  className 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(ref)
  
  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  )
}