"use client"

import { useState, useCallback } from "react"
import { PropertyGrid } from "./propertyGrid"
import type { Property } from "@/lib/property-data"

interface PropertyGridWrapperProps {
    initialProperties: Property[]
    initialTotalCount: number
    initialPage: number
    initialHasNextPage: boolean
}

export function PropertyGridWrapper({
    initialProperties,
    initialTotalCount,
    initialPage,
    initialHasNextPage
}: PropertyGridWrapperProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [properties, setProperties] = useState<Property[]>(initialProperties)
    const [totalCount, setTotalCount] = useState(initialTotalCount)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
    const [isLoading, setIsLoading] = useState(false)

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
            <PropertyGrid
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                properties={properties}
                totalCount={totalCount}
                isLoading={isLoading}
                pagination={{
                    page: currentPage,
                    hasNextPage
                }}
                onLoadMore={handleLoadMore}
                onSortChange={handleSortChange}
            />
        </main >
    )
}
