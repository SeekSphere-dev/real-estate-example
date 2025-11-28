import { MessageSquare, Cpu, Zap, Database } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Natural Language Input",
    description: "Users describe what they want in plain English. No need to learn complex filter systems.",
  },
  {
    icon: Cpu,
    title: "AI Classification",
    description: "Our intelligent classifier identifies intent, brands, categories, attributes, and preferences.",
  },
  {
    icon: Database,
    title: "Optimized Query",
    description: "Advanced NLP converts natural language into optimized SQL queries using MCP architecture.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Pre-processed database ensures millisecond response times with perfect matches.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            From query to results in milliseconds
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Our intelligent search platform converts natural language queries into optimized database queries using
            advanced NLP models.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="group relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border lg:block" />
              )}

              <div className="relative rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card">
                {/* Step number */}
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="mt-20 rounded-2xl border border-border bg-card/30 p-8 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="rounded-lg bg-secondary px-4 py-2 text-foreground">Natural Language Query</div>
            <span className="text-primary">→</span>
            <div className="rounded-lg bg-primary/20 px-4 py-2 text-primary">SeekSphere Core</div>
            <span className="text-primary">→</span>
            <div className="rounded-lg bg-secondary px-4 py-2 text-foreground">Classifier</div>
            <span className="text-primary">→</span>
            <div className="rounded-lg bg-secondary px-4 py-2 text-foreground">LLM (MCP)</div>
            <span className="text-primary">→</span>
            <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Results</div>
          </div>
        </div>
      </div>
    </section>
  )
}
