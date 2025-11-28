import { Check, Zap, Code, TrendingUp, Shield, Plug } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Pre-processed database ensures millisecond response times, even with millions of products.",
  },
  {
    icon: Code,
    title: "Developer-First",
    description: "Easy SDK integration with existing e-commerce platforms. RESTful API with comprehensive docs.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Architecture",
    description: "Built to handle millions of products and queries with DynamoDB + Redis infrastructure.",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "Two-tier approach: Developer SDK for enterprise clients, Plugin for SMBs.",
  },
  {
    icon: Plug,
    title: "Multi-Source Connector",
    description: "MCP Server connects to Catalogue APIs, Inventory DBs, and more data sources seamlessly.",
  },
  {
    icon: Check,
    title: "Intent Recognition",
    description: "Automatically identifies brands, categories, attributes, and user preferences with AI.",
  },
]

const stats = [
  { value: "10x", label: "Faster search experience" },
  { value: "95%", label: "Query understanding accuracy" },
  { value: "<50ms", label: "Average response time" },
  { value: "99.9%", label: "Uptime guarantee" },
]

export function WhySeekSphere() {
  return (
    <section id="why-us" className="relative py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">Why SeekSphere</p>
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Built for the future of search
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            Stop forcing users through endless filters. Let them search the way they naturally think and speak.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-20 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary md:text-5xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card/50 p-8 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
