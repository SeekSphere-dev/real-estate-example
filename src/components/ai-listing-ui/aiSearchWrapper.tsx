"use client"

import { useState, useCallback } from "react"
import { Header } from "./header"
import { PropertyGridWrapper } from "./propertyGridWrapper"
import type { Property } from "@/lib/property-data"

interface AiSearchWrapperProps {
    initialProperties: Property[]
    initialTotalCount: number
    initialPage: number
    initialHasNextPage: boolean
}

export function AiSearchWrapper({
    initialProperties,
    initialTotalCount,
    initialPage,
    initialHasNextPage
}: AiSearchWrapperProps) {
    const [properties, setProperties] = useState<Property[]>(initialProperties)
    const [totalCount, setTotalCount] = useState(initialTotalCount)
    const [isSearching, setIsSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string | null>(null)

    const handleSearch = useCallback(async (query: string) => {
        setIsSearching(true)
        setSearchQuery(query)
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            if (!response.ok) {
                throw new Error('Search failed')
            }
            const data = await response.json()
            if (data.data) {
                setProperties(data.data)
                setTotalCount(data.totalCount)
            }
        } catch (error) {
            console.error('Error searching:', error)
        } finally {
            setIsSearching(false)
        }
    }, [])

    const handleClearSearch = useCallback(() => {
        setSearchQuery(null)
        setProperties(initialProperties)
        setTotalCount(initialTotalCount)
    }, [initialProperties, initialTotalCount])

    return (
        <div className="min-h-screen bg-background">
            <Header onSearch={handleSearch} onClearSearch={handleClearSearch} />
            <PropertyGridWrapper
                properties={properties}
                totalCount={totalCount}
                initialPage={searchQuery ? 1 : initialPage}
                initialHasNextPage={searchQuery ? false : initialHasNextPage}
                isSearchResult={!!searchQuery}
                isLoading={isSearching}
                searchQuery={searchQuery}
            />
        </div>
    )
}
