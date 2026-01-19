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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count <= 2) return 'bg-green-200 dark:bg-green-900'
  if (count <= 4) return 'bg-green-400 dark:bg-green-700'
  if (count <= 6) return 'bg-green-500 dark:bg-green-600'
  return 'bg-green-600 dark:bg-green-500'
}

export function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    // Group data by weeks
    const weeks: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []

    // Find the first day and pad the beginning if necessary
    if (activityData.length > 0) {
      const firstDate = new Date(activityData[0].date)
      const firstDayOfWeek = firstDate.getDay()
      
      // Pad the beginning of the first week
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', count: -1 }) // -1 indicates empty cell
      }
    }

    activityData.forEach((day, index) => {
      currentWeek.push(day)
      
      const date = new Date(day.date)
      if (date.getDay() === 6 || index === activityData.length - 1) {
        // End of week (Saturday) or last day
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    // Generate month labels
    const monthLabels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      const validDay = week.find(d => d.count >= 0)
      if (validDay) {
        const month = new Date(validDay.date).getMonth()
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], weekIndex })
          lastMonth = month
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
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{ 
                  position: 'relative',
                  left: `${m.weekIndex * 14}px`,
                  marginRight: i < monthLabels.length - 1 
                    ? `${(monthLabels[i + 1]?.weekIndex - m.weekIndex - 3) * 14}px` 
                    : 0
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col mr-2 text-xs text-muted-foreground">
              <div className="h-[13px]"></div>
              <div className="h-[13px] leading-[13px]">Mon</div>
              <div className="h-[13px]"></div>
              <div className="h-[13px] leading-[13px]">Wed</div>
              <div className="h-[13px]"></div>
              <div className="h-[13px] leading-[13px]">Fri</div>
              <div className="h-[13px]"></div>
            </div>

            {/* Heatmap grid */}
            <TooltipProvider delayDuration={100}>
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      day.count === -1 ? (
                        <div key={dayIndex} className="w-[10px] h-[10px]" />
                      ) : (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[10px] h-[10px] rounded-sm ${getIntensityClass(day.count)} cursor-pointer transition-colors hover:ring-1 hover:ring-foreground`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              <span className="font-semibold">{day.count} submissions</span>
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
          <div className="flex items-center justify-end mt-4 gap-1 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-sm bg-muted" />
            <div className="w-[10px] h-[10px] rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-[10px] h-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="w-[10px] h-[10px] rounded-sm bg-green-500 dark:bg-green-600" />
            <div className="w-[10px] h-[10px] rounded-sm bg-green-600 dark:bg-green-500" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
