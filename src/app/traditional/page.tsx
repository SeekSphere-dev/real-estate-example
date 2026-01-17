import { Header } from "@/components/traditional-lisiting-ui/header"
import { SearchFilters } from "@/components/traditional-lisiting-ui/search-filters"
import { PropertyGrid } from "@/components/property-grid"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-80 shrink-0">
                        <SearchFilters />
                    </aside>
                    <div className="flex-1">
                        <PropertyGrid />
                    </div>
                </div>
            </main>
        </div>
    )
}
