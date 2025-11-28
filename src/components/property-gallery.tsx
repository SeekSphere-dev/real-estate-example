"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Grid3X3, X, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface PropertyImage {
    id: number
    imageUrl: string
    imageType: string
    caption: string
    displayOrder: number
    isPrimary: boolean
}

interface PropertyGalleryProps {
    images: PropertyImage[]
    title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showLightbox, setShowLightbox] = useState(false)
    const [showAllPhotos, setShowAllPhotos] = useState(false)

    const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
    const primaryImage = sortedImages[0]
    const secondaryImages = sortedImages.slice(1, 5)

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % sortedImages.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
    }

    return (
        <>
            {/* Desktop Gallery Grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden">
                <div
                    className="col-span-2 row-span-2 relative cursor-pointer group"
                    onClick={() => {
                        setCurrentIndex(0)
                        setShowLightbox(true)
                    }}
                >
                    <Image
                        src={primaryImage.imageUrl || "/placeholder.svg"}
                        alt={primaryImage.caption}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-1.5 rounded-md">
                            <Expand className="h-4 w-4" />
                            <span className="text-sm font-medium">View larger</span>
                        </div>
                    </div>
                </div>
                {secondaryImages.map((image, index) => (
                    <div
                        key={image.id}
                        className="relative cursor-pointer group overflow-hidden"
                        onClick={() => {
                            setCurrentIndex(index + 1)
                            setShowLightbox(true)
                        }}
                    >
                        <Image
                            src={image.imageUrl || "/placeholder.svg"}
                            alt={image.caption}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                ))}

                {/* Show All Photos Button */}
                <Button
                    variant="secondary"
                    className="absolute bottom-4 right-4 bg-card/90 backdrop-blur hover:bg-card"
                    onClick={() => setShowAllPhotos(true)}
                >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Show all {sortedImages.length} photos
                </Button>
            </div>

            {/* Mobile Gallery Carousel */}
            <div className="md:hidden relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                    src={sortedImages[currentIndex].imageUrl || "/placeholder.svg"}
                    alt={sortedImages[currentIndex].caption}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-card/80 backdrop-blur"
                        onClick={prevImage}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-card/80 backdrop-blur"
                        onClick={nextImage}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur px-3 py-1 rounded-full">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {sortedImages.length}
          </span>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 bg-card/80 backdrop-blur"
                    onClick={() => setShowAllPhotos(true)}
                >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    All photos
                </Button>
            </div>

            {/* Lightbox */}
            <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
                <DialogContent className="max-w-6xl h-[90vh] p-0 bg-black border-0" title="image">
                    <div className="relative h-full flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                            onClick={() => setShowLightbox(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-4 z-10 h-12 w-12 rounded-full text-white hover:bg-white/20"
                            onClick={prevImage}
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>
                        <div className="relative w-full h-full max-h-[80vh] mx-16">
                            <Image
                                src={sortedImages[currentIndex].imageUrl || "/placeholder.svg"}
                                alt={sortedImages[currentIndex].caption}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 z-10 h-12 w-12 rounded-full text-white hover:bg-white/20"
                            onClick={nextImage}
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                            <p className="text-center text-sm opacity-80 mb-1">{sortedImages[currentIndex].caption}</p>
                            <p className="text-center text-sm font-medium">
                                {currentIndex + 1} / {sortedImages.length}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* All Photos Modal */}
            <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" title="all photos">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setShowAllPhotos(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sortedImages.map((image, index) => (
                            <div
                                key={image.id}
                                className={cn(
                                    "relative cursor-pointer group rounded-lg overflow-hidden",
                                    index === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-[4/3]",
                                )}
                                onClick={() => {
                                    setCurrentIndex(index)
                                    setShowAllPhotos(false)
                                    setShowLightbox(true)
                                }}
                            >
                                <Image
                                    src={image.imageUrl || "/placeholder.svg"}
                                    alt={image.caption}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur">
                    {image.caption}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
