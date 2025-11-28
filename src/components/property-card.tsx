"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Bed, Bath, Square, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/property-data"

interface PropertyCardProps {
    property: Property
    viewMode: "grid" | "list"
}

export function PropertyCard({ property, viewMode }: PropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false)

    const formatPrice = (price: string) => {
        const num = Number.parseFloat(price)
        if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(2)}M`
        }
        return `$${(num / 1000).toFixed(0)}K`
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

    if (viewMode === "list") {
        return (
            <Link href={`/traditional/${property.id}`} prefetch={true}>
                <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-72 h-48 sm:h-auto shrink-0">
                            <Image
                                src={property.image.imageUrl || "/placeholder.svg"}
                                alt={property.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <Badge className={cn("absolute top-3 left-3", getStatusColor(property.status.name))}>
                                {property.status.name}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 bg-card/80 backdrop-blur hover:bg-card"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsFavorite(!isFavorite)
                                }}
                            >
                                <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                            </Button>
                        </div>

                        <div className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-serif text-2xl font-semibold text-foreground">
                                    {formatPrice(property.listPrice)}
                                    {property.monthlyRent && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                                </p>
                                <h3 className="text-lg font-medium text-foreground mt-1 group-hover:text-accent transition-colors">
                                    {property.title}
                                </h3>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                                {property.propertyType.name}
                            </Badge>
                        </div>

                        <div className="flex items-center text-muted-foreground text-sm mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.streetAddress}, {property.city.name}, {property.province.code}
                        </div>

                        <div className="flex items-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-1.5 text-foreground">
                                <Bed className="h-4 w-4 text-muted-foreground" />
                                <span>{property.bedrooms} beds</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground">
                                <Bath className="h-4 w-4 text-muted-foreground" />
                                <span>{Math.floor(Number.parseFloat(property.bathrooms))} baths</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground">
                                <Square className="h-4 w-4 text-muted-foreground" />
                                <span>{property.totalAreaSqft.toLocaleString()} sqft</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Listed {new Date(property.listedDate).toLocaleDateString()}
                            </div>
                            <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                            >
                                View Details
                            </Button>
                        </div>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link href={`/traditional/${property.id}`} prefetch={true}>
            <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={property.image.imageUrl || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <Badge className={cn("absolute top-3 left-3", getStatusColor(property.status.name))}>
                        {property.status.name}
                    </Badge>
                    <Badge variant="outline" className="absolute top-3 right-12 bg-card/80 backdrop-blur border-0">
                        {property.propertyType.name}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-card/80 backdrop-blur hover:bg-card h-8 w-8"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsFavorite(!isFavorite)
                        }}
                    >
                        <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                    </Button>
                    <div className="absolute bottom-3 left-3">
                        <p className="text-white text-2xl font-serif font-semibold drop-shadow-lg">
                            {formatPrice(property.listPrice)}
                            {property.monthlyRent && <span className="text-sm font-normal opacity-80">/mo</span>}
                        </p>
                    </div>
                </div>

                <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                    {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                    <span className="truncate">
            {property.city.name}, {property.province.code}
          </span>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
                    <div className="flex items-center gap-1.5 text-foreground">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <span>{Math.floor(Number.parseFloat(property.bathrooms))}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        <span>{property.totalAreaSqft.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">{property.neighborhood.name}</div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-accent hover:text-accent/80 h-auto p-0 text-xs"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    >
                        View Details →
                    </Button>
                </div>
                </div>
            </div>
        </Link>
    )
}
