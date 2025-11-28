import { MapPin, Footprints, Shield, Users, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Neighborhood {
    id: number
    name: string
    averageIncome: number
    walkabilityScore: number
    safetyRating: number
}

interface City {
    id: number
    name: string
    population: number
    latitude: string
    longitude: string
}

interface Province {
    id: number
    name: string
    code: string
    countryCode: string
}

interface PropertyNeighborhoodProps {
    neighborhood: Neighborhood
    city: City
    province: Province
}

export function PropertyNeighborhood({ neighborhood, city, province }: PropertyNeighborhoodProps) {
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("en-CA").format(num)
    }

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(num)
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            <h2 className="font-semibold text-lg text-foreground mb-2">Neighborhood</h2>
            <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="h-4 w-4 mr-1.5" />
                <span>
          {neighborhood.name}, {city.name}, {province.name}
        </span>
            </div>

            {/* Map Placeholder */}
            <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-secondary mb-6">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url(/placeholder.svg?height=300&width=600&query=street map of ${neighborhood.name} ${city.name})`,
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-card/90 backdrop-blur px-4 py-2 rounded-lg">
                        <p className="text-sm font-medium">Interactive map</p>
                    </div>
                </div>
            </div>

            {/* Neighborhood Stats */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Footprints className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Walk Score</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-semibold text-foreground">{neighborhood.walkabilityScore}</span>
                        <Progress value={neighborhood.walkabilityScore} className="flex-1 h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {neighborhood.walkabilityScore >= 70
                            ? "Very Walkable"
                            : neighborhood.walkabilityScore >= 50
                                ? "Somewhat Walkable"
                                : "Car-Dependent"}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Safety Rating</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-semibold text-foreground">{neighborhood.safetyRating}/5</span>
                        <Progress value={neighborhood.safetyRating * 20} className="flex-1 h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {neighborhood.safetyRating >= 4 ? "Very Safe" : neighborhood.safetyRating >= 3 ? "Safe" : "Moderate"}
                    </p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Avg. Income</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(neighborhood.averageIncome)}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">City Population</span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">{formatNumber(city.population)}</p>
                </div>
            </div>
        </div>
    )
}
