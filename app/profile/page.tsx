"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatsCards, ActivityHeatmap, SubmissionsChart } from "@/components/profile"
import { useUserStats } from "@/hooks/use-user-stats"
import useUser from "@/hooks/use-user"

export default function ProfilePage() {
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: stats, isLoading: statsLoading, error } = useUserStats(user?.id)

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user?.id) {
      router.push('/signin')
    }
  }, [user, userLoading, router])

  if (userLoading) {
    return <ProfileSkeleton />
  }

  if (!user?.id) {
    return null // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load statistics. Please try again later.</p>
        </Card>
      ) : stats ? (
        <div className="space-y-8">
          <StatsCards stats={stats} />
          
          <div className="grid gap-8 lg:grid-cols-1">
            <ActivityHeatmap activityData={stats.activityData} />
            <SubmissionsChart submissionHistory={stats.submissionHistory} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-8">
        <CardContent className="flex items-center gap-6 pt-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
      <StatsSkeleton />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
