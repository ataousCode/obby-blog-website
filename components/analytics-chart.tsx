'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartData {
  date: string
  views: number
  visitors?: number
  sessions?: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  title: string
  dataKey: keyof ChartData
  color?: string
}

export function AnalyticsChart({ data, title, dataKey, color = '#3b82f6' }: AnalyticsChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map(item => Number(item[dataKey]) || 0))
  }, [data, dataKey])

  const chartHeight = 200

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: chartHeight }}>
          <svg width="100%" height={chartHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <g key={index}>
                <line
                  x1="0"
                  y1={chartHeight * ratio}
                  x2="100%"
                  y2={chartHeight * ratio}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="0"
                  y={chartHeight * ratio - 5}
                  fontSize="12"
                  fill="#6b7280"
                  className="text-xs"
                >
                  {Math.round(maxValue * (1 - ratio))}
                </text>
              </g>
            ))}
            
            {/* Chart line */}
            {data.length > 1 && (
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={data
                  .map((item, index) => {
                    const x = (index / (data.length - 1)) * 100
                    const value = Number(item[dataKey]) || 0
                    const y = chartHeight - (value / maxValue) * chartHeight
                    return `${x}%,${y}`
                  })
                  .join(' ')}
              />
            )}
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * 100
              const value = Number(item[dataKey]) || 0
              const y = chartHeight - (value / maxValue) * chartHeight
              
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={y}
                    r="4"
                    fill={color}
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                  <title>{`${item.date}: ${value}`}</title>
                </g>
              )
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {data.map((item, index) => {
              // Show only every few labels to avoid crowding
              const showLabel = index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 5) === 0
              return (
                <span key={index} className={showLabel ? '' : 'invisible'}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PieChartData {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: PieChartData[]
  title: string
}

export function PieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
  
  let currentAngle = 0
  const radius = 80
  const centerX = 100
  const centerY = 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const angle = (item.value / total) * 360
                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                
                const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
                const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
                const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
                const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
                
                const largeArcFlag = angle > 180 ? 1 : 0
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  'Z'
                ].join(' ')
                
                currentAngle += angle
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color || colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <title>{`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}</title>
                  </path>
                )
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="ml-6 space-y-2">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || colors[index % colors.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.label}: {item.value} ({percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  description?: string
}

export function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}% from last period
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}