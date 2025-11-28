import { History, TrendingUp, TrendingDown, Home } from "lucide-react"

interface HistoryEvent {
    date: string
    event: string
    price?: string
}

interface PropertyHistoryProps {
    history: HistoryEvent[]
}

export function PropertyHistory({ history }: PropertyHistoryProps) {
    const formatCurrency = (value: string) => {
        const num = Number.parseFloat(value)
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(num)
    }

    const getEventIcon = (event: string) => {
        if (event.toLowerCase().includes("sold")) {
            return TrendingUp
        }
        if (event.toLowerCase().includes("listed")) {
            return TrendingDown
        }
        return Home
    }

    if (history.length === 0) {
        return null
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
                <History className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg text-foreground">Property History</h2>
            </div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-6">
                    {history.map((item, index) => {
                        const Icon = getEventIcon(item.event)
                        return (
                            <div key={index} className="relative flex items-start gap-4 pl-10">
                                {/* Timeline dot */}
                                <div className="absolute left-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-card">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="flex-1 flex items-center justify-between py-1">
                                    <div>
                                        <p className="font-medium text-foreground">{item.event}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(item.date).toLocaleDateString("en-CA", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    {item.price && <p className="font-semibold text-foreground">{formatCurrency(item.price)}</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
