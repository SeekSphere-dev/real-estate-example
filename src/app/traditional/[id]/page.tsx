import { Header } from "@/components/traditional-lisiting-ui/header"
import { PropertyGallery } from "@/components/property-gallery"
import { PropertyOverview } from "@/components/property-overview"
import { PropertyDetails } from "@/components/property-details"
import { PropertyFeatures } from "@/components/property-features"
import { PropertyAgent } from "@/components/property-agent"
import { PropertyNeighborhood } from "@/components/property-neighborhood"
import { PropertyHistory } from "@/components/property-history"
import { PropertyCTA } from "@/components/property-cta"
import { notFound } from 'next/navigation'

async function getProperty(id: string) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/properties/${id}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch property')
  }

  return response.json()
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: propertyDetail } = await getProperty(id)
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <PropertyGallery images={propertyDetail.images} title={propertyDetail.title} />

                <div className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <PropertyOverview property={propertyDetail} />
                        <PropertyDetails property={propertyDetail} />
                        <PropertyFeatures features={propertyDetail.features} />
                        <PropertyNeighborhood
                            neighborhood={propertyDetail.neighborhood}
                            city={propertyDetail.city}
                            province={propertyDetail.province}
                        />
                        <PropertyHistory history={propertyDetail.history} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <PropertyCTA property={propertyDetail} />
                        <PropertyAgent agent={propertyDetail.agent} />
                    </div>
                </div>
            </main>
        </div>
    )
}
