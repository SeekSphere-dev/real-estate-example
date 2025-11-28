"use client"

import { useState } from "react"
import { Heart, Share2, MapPin, Bed, Bath, Square, Calendar, Building, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { PropertyDetail } from "@/lib/property-detail-data"

interface PropertyOverviewProps {
    property: PropertyDetail
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false)

    const formatPrice = (price: string) => {
        const num = Number.parseFloat(price)
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(num)
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-accent text-accent-foreground"
            case "pending":
                return "bg-amber-500 text-white"
            case "sold":
                return "bg-muted text-muted-foreground"
            default:
                return "bg-secondary text-secondary-foreground"
        }
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn(getStatusColor(property.status.name))}>{property.status.name}</Badge>
                        <Badge variant="outline">{property.listingType.name}</Badge>
                        <Badge variant="outline">{property.propertyType.name}</Badge>
                    </div>
                    <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-foreground">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-2">
                        <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                        <span>
              {property.streetAddress}
                            {property.unitNumber && `, Unit ${property.unitNumber}`}, {property.city.name}, {property.province.code}{" "}
                            {property.postalCode}
            </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                        <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Separator className="my-6" />

            {/* Price and Key Stats */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                    <p className="text-muted-foreground text-sm mb-1">List Price</p>
                    <p className="font-serif text-3xl lg:text-4xl font-semibold text-foreground">
                        {formatPrice(property.listPrice)}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">{formatPrice(property.pricePerSqft)}/sqft</p>
                </div>
                <div className="flex flex-wrap gap-6 lg:gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Bed className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{property.bedrooms}</p>
                            <p className="text-xs text-muted-foreground">Bedrooms</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Bath className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">
                                {Math.floor(Number.parseFloat(property.bathrooms))}
                                {property.halfBathrooms > 0 && <span className="text-muted-foreground">.{property.halfBathrooms}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">Bathrooms</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Square className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{property.totalAreaSqft.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Sq Ft</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Building className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{property.yearBuilt}</p>
                            <p className="text-xs text-muted-foreground">Year Built</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div>
                <h2 className="font-semibold text-lg text-foreground mb-3">About this property</h2>
                <p className={cn("text-muted-foreground leading-relaxed", !showFullDescription && "line-clamp-4")}>
                    {property.description}
                </p>
                {property.description.length > 300 && (
                    <Button
                        variant="link"
                        className="px-0 text-accent"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                        {showFullDescription ? "Show less" : "Read more"}
                    </Button>
                )}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Listed</span>
                    <span className="font-medium">{new Date(property.listedDate).toLocaleDateString()}</span>
                </div>
                {property.mlsNumber && (
                    <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">MLS#</span>
                        <span className="font-medium">{property.mlsNumber}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
