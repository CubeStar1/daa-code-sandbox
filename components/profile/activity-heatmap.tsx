"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActivityHeatmapProps {
  activityData: { date: string; count: number }[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 2) return 'bg-green-200 dark:bg-green-900'
  if (count <= 4) return 'bg-green-400 dark:bg-green-700'
  if (count <= 6) return 'bg-green-500 dark:bg-green-600'
  return 'bg-green-600 dark:bg-green-500'
}

export function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    // Create a map for quick lookup
    const dataMap = new Map<string, number>()
    activityData.forEach(d => dataMap.set(d.date, d.count))

    // End date is today (Jan 19, 2026)
    const today = new Date()
    
    // Start from 52 weeks ago, adjusted to Sunday
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (52 * 7))
    // Adjust to the nearest Sunday (start of week)
    const startDayOfWeek = startDate.getDay()
    if (startDayOfWeek !== 0) {
      startDate.setDate(startDate.getDate() - startDayOfWeek)
    }

    // Build weeks array - each week is a column (Sun-Sat)
    const weeks: { date: string; count: number; isValid: boolean }[][] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= today || weeks.length < 53) {
      const week: { date: string; count: number; isValid: boolean }[] = []
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const isFuture = currentDate > today
        
        if (isFuture) {
          week.push({ date: '', count: -1, isValid: false })
        } else {
          const count = dataMap.get(dateStr) ?? 0
          week.push({ date: dateStr, count, isValid: true })
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      weeks.push(week)
      
      // Safety break
      if (weeks.length >= 54) break
    }

    // Generate month labels based on first day of each month appearing
    const monthLabels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      for (const day of week) {
        if (day.isValid && day.date) {
          const date = new Date(day.date)
          const month = date.getMonth()
          const dayOfMonth = date.getDate()
          
          // Only add label when we hit a new month (check if it's early in the month)
          if (month !== lastMonth && dayOfMonth <= 7) {
            monthLabels.push({ label: MONTHS[month], weekIndex })
            lastMonth = month
            break
          } else if (month !== lastMonth) {
            lastMonth = month
          }
        }
      }
    })

    return { weeks, monthLabels }
  }, [activityData])

  const totalSubmissions = activityData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {totalSubmissions} submissions in the last year
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {/* Month labels row */}
          <div className="flex mb-2">
            <div className="w-10 shrink-0" /> {/* Spacer for day labels */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
              {weeks.map((week, weekIndex) => {
                const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex)
                return (
                  <div key={weekIndex} className="text-xs text-muted-foreground">
                    {monthLabel?.label || ''}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main grid: day labels + heatmap */}
          <div className="flex gap-2">
            {/* Day labels column */}
            <div className="w-8 shrink-0 flex flex-col justify-between py-[2px]">
              <div className="text-xs text-muted-foreground h-[14px]"></div>
              <div className="text-xs text-muted-foreground h-[14px] flex items-center">Mon</div>
              <div className="text-xs text-muted-foreground h-[14px]"></div>
              <div className="text-xs text-muted-foreground h-[14px] flex items-center">Wed</div>
              <div className="text-xs text-muted-foreground h-[14px]"></div>
              <div className="text-xs text-muted-foreground h-[14px] flex items-center">Fri</div>
              <div className="text-xs text-muted-foreground h-[14px]"></div>
            </div>

            {/* Heatmap grid - spreads across full width */}
            <TooltipProvider delayDuration={100}>
              <div 
                className="flex-1 grid gap-[3px]" 
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
              >
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      !day.isValid ? (
                        <div 
                          key={dayIndex} 
                          className="aspect-square w-full max-w-[14px]"
                        />
                      ) : (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`aspect-square w-full max-w-[14px] rounded-sm ${getIntensityClass(day.count)} cursor-pointer transition-colors hover:ring-1 hover:ring-foreground`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              <span className="font-semibold">{day.count} submission{day.count !== 1 ? 's' : ''}</span>
                              <br />
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-4 gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-[12px] h-[12px] rounded-sm bg-muted" />
              <div className="w-[12px] h-[12px] rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-[12px] h-[12px] rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-[12px] h-[12px] rounded-sm bg-green-500 dark:bg-green-600" />
              <div className="w-[12px] h-[12px] rounded-sm bg-green-600 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
