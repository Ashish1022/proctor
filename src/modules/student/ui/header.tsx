import { BookOpen } from "lucide-react"

export function StudentHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold">ITSA</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Student Portal</p>
          </div>
        </div>
      </div>
    </header>
  )
}
