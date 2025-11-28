import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Feature {
    id: number
    name: string
    category: string
    description: string
}

interface PropertyFeaturesProps {
    features: Feature[]
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
    const groupedFeatures = features.reduce(
        (acc, feature) => {
            const category = feature.category
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(feature)
            return acc
        },
        {} as Record<string, Feature[]>,
    )

    const categoryLabels: Record<string, string> = {
        interior: "Interior Features",
        exterior: "Exterior Features",
        kitchen: "Kitchen Features",
        neighborhood: "Location Features",
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            <h2 className="font-semibold text-lg text-foreground mb-6">Features & Amenities</h2>
            <div className="space-y-6">
                {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                    <div key={category}>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            {categoryLabels[category] || category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {categoryFeatures.map((feature) => (
                                <Badge key={feature.id} variant="secondary" className="px-3 py-1.5 text-sm font-normal">
                                    <Check className="h-3.5 w-3.5 mr-1.5 text-accent" />
                                    {feature.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
