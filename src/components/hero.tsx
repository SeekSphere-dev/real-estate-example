import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Filter } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">AI-Powered Search Experience</span>
        </div>

        {/* Main headline */}
        <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-7xl">
          Search the way you <span className="text-primary">think</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-12 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Transform complex filter-heavy experiences into simple, natural language conversations. No more endless
          clicking through filters.
        </p>

        {/* Dual CTA buttons */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group h-14 min-w-[240px] gap-3 border-border bg-secondary/50 text-foreground hover:bg-secondary"
          >
            <Link href="/traditional">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span>Traditional Search</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="group h-14 min-w-[240px] gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/ai-search">
              <Sparkles className="h-5 w-5" />
              <span>AI-Powered Search</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Search comparison visual */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Traditional search card */}
          <div className="rounded-2xl border border-border bg-card/50 p-6 text-left backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Traditional Search</span>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <p className="text-muted-foreground">{'1. Search "3BHK apartment"'}</p>
              <p className="text-muted-foreground">{"2. Filter by price range"}</p>
              <p className="text-muted-foreground">{"3. Filter by location"}</p>
              <p className="text-muted-foreground">{"4. Filter by amenities"}</p>
              <p className="text-muted-foreground">{"5. Filter by builder..."}</p>
            </div>
            <div className="mt-4 text-xs text-muted-foreground/60">5+ steps • Multiple clicks • Frustrating</div>
          </div>

          {/* AI search card */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-left backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">SeekSphere AI</span>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <p className="text-foreground">{'"3BHK under 2cr in Whitefield with gym and pool"'}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-primary">Perfect matches found</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-primary/60">1 step • Natural language • Instant results</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-border p-2">
          <div className="h-2 w-1 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </section>
  )
}
