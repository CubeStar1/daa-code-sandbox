import { Button } from "@/components/ui/button"

interface ProblemsErrorStateProps {
  error: string
  onRetry?: () => void
}

export function ProblemsErrorState({ error, onRetry }: ProblemsErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Error Loading Problems</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry || (() => window.location.reload())}>
          Retry
        </Button>
      </div>
    </div>
  )
}
