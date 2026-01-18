"use client"

import { useState, useCallback, useEffect } from "react"
import { PropertyGrid } from "./propertyGrid"
import type { Property } from "@/lib/property-data"

interface PropertyGridWrapperProps {
    properties: Property[]
    totalCount: number
    initialPage: number
    initialHasNextPage: boolean
    isSearchResult?: boolean
    isLoading?: boolean
    searchQuery?: string | null
    searchElapsedTime?: number
}

export function PropertyGridWrapper({
    properties: propProperties,
    totalCount: propTotalCount,
    initialPage,
    initialHasNextPage,
    isSearchResult = false,
    isLoading: externalLoading = false,
    searchQuery,
    searchElapsedTime = 0
}: PropertyGridWrapperProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [properties, setProperties] = useState<Property[]>(propProperties)
    const [totalCount, setTotalCount] = useState(propTotalCount)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
    const [isLoading, setIsLoading] = useState(false)

    // Update properties when they change from parent (e.g., search results)
    useEffect(() => {
        setProperties(propProperties)
        setTotalCount(propTotalCount)
        if (isSearchResult) {
            setCurrentPage(1)
            setHasNextPage(false)
        }
    }, [propProperties, propTotalCount, isSearchResult])

    const handleLoadMore = useCallback(async () => {
        if (isLoading || !hasNextPage) return

        setIsLoading(true)
        try {
            const nextPage = currentPage + 1
            const response = await fetch(`/api/properties?page=${nextPage}&limit=10`)
            const data = await response.json()

            if (data.data) {
                setProperties(prev => [...prev, ...data.data])
                setCurrentPage(nextPage)
                setHasNextPage(data.pagination.hasNextPage)
                setTotalCount(data.pagination.totalCount)
            }
        } catch (error) {
            console.error("Error loading more properties:", error)
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, hasNextPage, isLoading])

    const handleSortChange = useCallback(async (value: string) => {
        setIsLoading(true)
        try {
            // For now, we'll just reload the first page with sorting
            // You can extend the API to support sorting if needed
            const response = await fetch(`/api/properties?page=1&limit=10`)
            const data = await response.json()

            if (data.data) {
                setProperties(data.data)
                setCurrentPage(1)
                setHasNextPage(data.pagination.hasNextPage)
                setTotalCount(data.pagination.totalCount)
            }
        } catch (error) {
            console.error("Error sorting properties:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    return (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {searchQuery && (
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing results for: <span className="font-medium text-foreground">&quot;{searchQuery}&quot;</span>
                    {" "}({totalCount} {totalCount === 1 ? 'property' : 'properties'} found)
                </div>
            )}
            <PropertyGrid
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                properties={properties}
                totalCount={totalCount}
                isLoading={isLoading || externalLoading}
                loadingElapsedTime={externalLoading ? searchElapsedTime : 0}
                pagination={{
                    page: currentPage,
                    hasNextPage: isSearchResult ? false : hasNextPage
                }}
                onLoadMore={isSearchResult ? () => {} : handleLoadMore}
                onSortChange={handleSortChange}
            />
        </main >
    )
}
