"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useSearch } from "@/lib/contexts/search-context"

interface FilterSectionProps {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border-b border-border pb-5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground"
            >
                {title}
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>
            <div className={cn("space-y-3 pt-2", isOpen ? "block" : "hidden")}>{children}</div>
        </div>
    )
}

export function SearchFilters() {
    const { filters, updateFilters, resetFilters, executeSearch } = useSearch()
    const [localPriceRange, setLocalPriceRange] = useState([200000, 1500000])
    const [localSqftRange, setLocalSqftRange] = useState([500, 5000])
    const [localBedrooms, setLocalBedrooms] = useState("Any")
    const [localBathrooms, setLocalBathrooms] = useState("Any")
    const [localListingTypes, setLocalListingTypes] = useState<string[]>([])
    const [localPropertyTypes, setLocalPropertyTypes] = useState<string[]>([])
    const [localStatus, setLocalStatus] = useState<string[]>([])

    // Sync local state with context filters
    useEffect(() => {
        setLocalPriceRange(filters.priceRange || [200000, 1500000])
        setLocalSqftRange(filters.sqftRange || [500, 5000])
        setLocalBedrooms(filters.bedrooms?.toString() || "Any")
        setLocalBathrooms(filters.bathrooms?.toString() || "Any")
        setLocalListingTypes(filters.listingTypes || [])
        setLocalPropertyTypes(filters.propertyTypes || [])
        setLocalStatus(filters.status || [])
    }, [filters])

    const handleApplyFilters = () => {
        const newFilters = {
            priceRange: localPriceRange as [number, number],
            sqftRange: localSqftRange as [number, number],
            bedrooms: localBedrooms === "Any" ? undefined : localBedrooms,
            bathrooms: localBathrooms === "Any" ? undefined : localBathrooms,
            listingTypes: localListingTypes,
            propertyTypes: localPropertyTypes,
            status: localStatus,
        }
        
        updateFilters(newFilters)
        // Execute search with the new filters directly to avoid race condition
        executeSearch({ ...filters, ...newFilters })
    }

    const handleClearAll = () => {
        resetFilters()
    }

    const toggleListingType = (type: string) => {
        const mappedType = type === "For Sale" ? "Sale" : type === "For Rent" ? "Rent" : "Lease"
        setLocalListingTypes(prev =>
            prev.includes(mappedType)
                ? prev.filter(t => t !== mappedType)
                : [...prev, mappedType]
        )
    }

    const togglePropertyType = (type: string) => {
        setLocalPropertyTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    const toggleStatus = (status: string) => {
        setLocalStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        )
    }

    const formatPrice = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`
        }
        return `$${(value / 1000).toFixed(0)}K`
    }

    return (
        <div className="bg-card rounded-lg border border-border p-5 sticky top-28 h-[80vh] overflow-scroll">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filters
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent/80 h-auto p-0"
                    onClick={handleClearAll}
                >
                    Clear all
                </Button>
            </div>

            <div className="space-y-5">
                {/* Listing Type */}
                <FilterSection title="Listing Type">
                    <div className="space-y-2">
                        {["For Sale", "For Rent", "Lease"].map((type) => {
                            const mappedType = type === "For Sale" ? "Sale" : type === "For Rent" ? "Rent" : "Lease"
                            return (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={type}
                                        checked={localListingTypes.includes(mappedType)}
                                        onCheckedChange={() => toggleListingType(type)}
                                    />
                                    <Label htmlFor={type} className="text-sm font-normal text-muted-foreground cursor-pointer">
                                        {type}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                </FilterSection>

                {/* Property Type */}
                <FilterSection title="Property Type">
                    <div className="space-y-2">
                        {["House", "Condo", "Townhouse", "Apartment", "Land"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                    id={type}
                                    checked={localPropertyTypes.includes(type)}
                                    onCheckedChange={() => togglePropertyType(type)}
                                />
                                <Label htmlFor={type} className="text-sm font-normal text-muted-foreground cursor-pointer">
                                    {type}
                                </Label>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                    <div className="space-y-4">
                        <Slider
                            value={localPriceRange}
                            onValueChange={setLocalPriceRange}
                            min={0}
                            max={3000000}
                            step={50000}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{formatPrice(localPriceRange[0])}</span>
                            <span className="text-muted-foreground">{formatPrice(localPriceRange[1])}</span>
                        </div>
                    </div>
                </FilterSection>

                {/* Bedrooms */}
                <FilterSection title="Bedrooms">
                    <div className="flex flex-wrap gap-2">
                        {["Any", "1+", "2+", "3+", "4+", "5+"].map((beds) => (
                            <Button
                                key={beds}
                                variant={localBedrooms === beds ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 px-3", localBedrooms === beds && "bg-primary text-primary-foreground")}
                                onClick={() => setLocalBedrooms(beds)}
                            >
                                {beds}
                            </Button>
                        ))}
                    </div>
                </FilterSection>

                {/* Bathrooms */}
                <FilterSection title="Bathrooms">
                    <div className="flex flex-wrap gap-2">
                        {["Any", "1+", "2+", "3+", "4+"].map((baths) => (
                            <Button
                                key={baths}
                                variant={localBathrooms === baths ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 px-3", localBathrooms === baths && "bg-primary text-primary-foreground")}
                                onClick={() => setLocalBathrooms(baths)}
                            >
                                {baths}
                            </Button>
                        ))}
                    </div>
                </FilterSection>

                {/* Square Footage */}
                <FilterSection title="Square Footage">
                    <div className="space-y-4">
                        <Slider value={localSqftRange} onValueChange={setLocalSqftRange} min={0} max={10000} step={100} className="w-full" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{localSqftRange[0].toLocaleString()} sqft</span>
                            <span className="text-muted-foreground">{localSqftRange[1].toLocaleString()} sqft</span>
                        </div>
                    </div>
                </FilterSection>

                {/* Status */}
                <FilterSection title="Status" defaultOpen={false}>
                    <div className="space-y-2">
                        {["Active", "Pending", "Sold", "Off Market"].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                    id={status}
                                    checked={localStatus.includes(status)}
                                    onCheckedChange={() => toggleStatus(status)}
                                />
                                <Label htmlFor={status} className="text-sm font-normal text-muted-foreground cursor-pointer">
                                    {status}
                                </Label>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4"
                    onClick={handleApplyFilters}
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    )
}
