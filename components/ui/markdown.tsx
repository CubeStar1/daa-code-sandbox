"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border rounded-md">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          th: ({ children }) => <th className="border border-border p-2 text-left font-medium text-sm">{children}</th>,
          td: ({ children }) => <td className="border border-border p-2 text-sm">{children}</td>,
          code: ({ inline, children }) =>
            inline ? (
              <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
            ) : (
              <pre className="bg-background p-3 rounded-md overflow-x-auto my-3">
                <code className="text-sm font-mono">{children}</code>
              </pre>
            ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-background/30 rounded-r-md">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => <h1 className="text-lg font-bold mt-6 mb-3 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mt-5 mb-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mt-4 mb-2 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-medium mt-3 mb-1 text-foreground">{children}</h4>,
          p: ({ children }) => <p className="mb-3 leading-relaxed text-sm">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 list-disc list-inside space-y-1 ml-4">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal list-inside space-y-1 ml-4">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-muted-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
