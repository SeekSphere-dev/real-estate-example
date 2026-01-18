"use client"

import { Grid3X3, List, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyCard } from "@/components/property-card"
import type { Property } from "@/lib/property-data";

interface Pagination {
    page: number
    hasNextPage: boolean
}

interface PropertyGridUIProps {
    viewMode: "grid" | "list"
    onViewModeChange: (mode: "grid" | "list") => void
    properties: Property[]
    totalCount: number
    isLoading: boolean
    loadingElapsedTime?: number
    pagination: Pagination
    onLoadMore: () => void
    onSortChange?: (value: string) => void
}

const getLoadingMessage = (elapsedSeconds: number): string => {
    if (elapsedSeconds < 5) {
        return "Searching properties..."
    } else if (elapsedSeconds < 10) {
        return "AI is doing its magic..."
    } else if (elapsedSeconds < 15) {
        return "Finding the perfect matches..."
    } else if (elapsedSeconds < 20) {
        return "Almost there, hang tight..."
    } else {
        return "This is taking a while, but we're on it..."
    }
}

export function PropertyGrid({
                                   viewMode,
                                   onViewModeChange,
                                   properties,
                                   totalCount,
                                   isLoading,
                                   loadingElapsedTime = 0,
                                   pagination,
                                   onLoadMore,
                                   onSortChange
                               }: PropertyGridUIProps) {
    return (
        <div>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">Properties for Sale</h1>
                    <p className="text-muted-foreground text-sm mt-1">{totalCount} properties found</p>
                </div>

                <div className="flex items-center gap-3">
                    <Select defaultValue="newest" onValueChange={onSortChange}>
                        <SelectTrigger className="w-[160px] bg-card border-border">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="sqft">Square Footage</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center bg-secondary rounded-md p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={viewMode === "grid" ? "bg-card shadow-sm" : ""}
                            onClick={() => onViewModeChange("grid")}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={viewMode === "list" ? "bg-card shadow-sm" : ""}
                            onClick={() => onViewModeChange("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button variant="outline" className="hidden sm:flex bg-transparent">
                        <MapPin className="h-4 w-4 mr-2" />
                        Map View
                    </Button>
                </div>
            </div>

            {/* Property Grid */}
            <div
                className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}
            >
                {isLoading && (
                    <div className="col-span-full text-center py-12">
                        <div className="relative mx-auto w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                            {loadingElapsedTime >= 5 && (
                                <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
                                    <span className="text-lg">✨</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-muted-foreground font-medium transition-all duration-300">
                            {getLoadingMessage(loadingElapsedTime)}
                        </p>
                        {loadingElapsedTime >= 5 && (
                            <p className="mt-1 text-xs text-muted-foreground/70">
                                {loadingElapsedTime}s elapsed
                            </p>
                        )}
                    </div>
                )}
                {!isLoading && properties.length === 0 && (
                    <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No properties found matching your criteria.</p>
                    </div>
                )}
                {!isLoading && properties.length > 0 && properties.map((property) => (
                    <PropertyCard key={property.id} property={property} viewMode={viewMode} />
                ))}
            </div>

            {/* Load More */}
            {pagination.hasNextPage && (
                <div className="mt-10 text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        className="px-8 bg-transparent"
                        onClick={onLoadMore}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Load More Properties'}
                    </Button>
                </div>
            )}
        </div>
    )
}
