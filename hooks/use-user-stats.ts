import { useQuery } from '@tanstack/react-query'
import type { UserStats } from '@/app/api/user/stats/route'

async function fetchUserStats(userId: string): Promise<UserStats> {
  const response = await fetch(`/api/user/stats?userId=${userId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user stats')
  }
  return response.json()
}

export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
