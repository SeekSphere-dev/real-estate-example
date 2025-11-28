import { Home, Thermometer, Snowflake, Car, PawPrint, Sofa, Layers, Ruler } from "lucide-react"
import type { PropertyDetail } from "@/lib/property-detail-data"

interface PropertyDetailsProps {
    property: PropertyDetail
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
    const formatCurrency = (value: string | null) => {
        if (!value) return "N/A"
        const num = Number.parseFloat(value)
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(num)
    }

    const details = [
        { label: "Property Type", value: property.propertyType.name, icon: Home },
        { label: "Year Built", value: property.yearBuilt.toString(), icon: Home },
        { label: "Total Area", value: `${property.totalAreaSqft} sqft`, icon: Ruler },
        { label: "Lot Size", value: `${property.lotSizeSqft} sqft`, icon: Layers },
        { label: "Floors", value: property.floors.toString(), icon: Layers },
        { label: "Heating", value: property.heatingType, icon: Thermometer },
        { label: "Cooling", value: property.coolingType, icon: Snowflake },
        { label: "Parking", value: `${property.parkingSpaces} - ${property.parkingType}`, icon: Car },
        { label: "Pet Friendly", value: property.petFriendly ? "Yes" : "No", icon: PawPrint },
        { label: "Furnished", value: property.furnished ? "Yes" : "No", icon: Sofa },
        { label: "Property Taxes", value: `${formatCurrency(property.propertyTaxesAnnual)}/year`, icon: Home },
        {
            label: "Maintenance Fee",
            value: property.maintenanceFee ? `${formatCurrency(property.maintenanceFee)}/month` : "N/A",
            icon: Home,
        },
    ]

    return (
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            <h2 className="font-semibold text-lg text-foreground mb-6">Property Details</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                {details.map((detail) => (
                    <div key={detail.label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                            <detail.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{detail.label}</p>
                            <p className="font-medium text-foreground">{detail.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
