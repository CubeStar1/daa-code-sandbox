import type { Problem } from '@/lib/database-types'

export const problemNavigation = {
  getNextProblem: (currentProblem: Problem, problems: Problem[]): Problem | null => {
    if (!currentProblem || problems.length === 0) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    const nextIndex = (currentIndex + 1) % problems.length
    return problems[nextIndex] || null
  },

  getPreviousProblem: (currentProblem: Problem, problems: Problem[]): Problem | null => {
    if (!currentProblem || problems.length === 0) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    const prevIndex = (currentIndex - 1 + problems.length) % problems.length
    return problems[prevIndex] || null
  },

  getRandomProblem: (currentProblem: Problem, problems: Problem[]): Problem | null => {
    if (!currentProblem || problems.length <= 1) return null
    
    const currentIndex = problems.findIndex(p => p.id === currentProblem.id)
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * problems.length)
    } while (randomIndex === currentIndex)
    
    return problems[randomIndex] || null
  },

  getProblemById: (problemId: string, problems: Problem[]): Problem | null => {
    return problems.find(p => p.id === problemId) || null
  }
}
