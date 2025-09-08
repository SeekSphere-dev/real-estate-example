'use client';

import { PropertyImage } from '@/lib/types';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
  className?: string;
}

export function PropertyGallery({ images, propertyTitle, className }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Sort images to show primary first, then by display_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const validImages = sortedImages.filter((_, index) => !imageErrors.has(index));

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (validImages.length === 0) {
    return (
      <div className={clsx('bg-gray-100 rounded-lg flex items-center justify-center', className)}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4" />
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={clsx('relative', className)}>
        {/* Main Image */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={validImages[currentIndex]?.image_url}
            alt={validImages[currentIndex]?.caption || `${propertyTitle} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(currentIndex)}
          />
          
          {/* Zoom Button */}
          <button
            onClick={() => openLightbox(currentIndex)}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  'flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors',
                  currentIndex === index 
                    ? 'border-blue-500' 
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <img
                  src={image.image_url}
                  alt={image.caption || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Main Lightbox Image */}
            <img
              src={validImages[currentIndex]?.image_url}
              alt={validImages[currentIndex]?.caption || `${propertyTitle} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation in Lightbox */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
                <p className="text-sm">
                  {validImages[currentIndex]?.caption || `Image ${currentIndex + 1} of ${validImages.length}`}
                </p>
                {validImages.length > 1 && (
                  <p className="text-xs opacity-75 mt-1">
                    Use arrow keys or buttons to navigate
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface CompactGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
  maxImages?: number;
  className?: string;
}

export function CompactGallery({ 
  images, 
  propertyTitle, 
  maxImages = 4, 
  className 
}: CompactGalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Sort images to show primary first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const displayImages = sortedImages.slice(0, maxImages);
  const remainingCount = Math.max(0, sortedImages.length - maxImages);

  if (sortedImages.length === 0) {
    return (
      <div className={clsx('bg-gray-100 rounded-lg flex items-center justify-center h-32', className)}>
        <p className="text-gray-500 text-sm">No images</p>
      </div>
    );
  }

  return (
    <>
      <div className={clsx('grid grid-cols-2 gap-1 rounded-lg overflow-hidden', className)}>
        {displayImages.map((image, index) => (
          <div
            key={image.id}
            className={clsx(
              'relative aspect-square bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity',
              index === 0 && displayImages.length > 1 ? 'col-span-2' : '',
              index === 0 ? 'aspect-video' : 'aspect-square'
            )}
            onClick={() => setIsGalleryOpen(true)}
          >
            <img
              src={image.image_url}
              alt={image.caption || `${propertyTitle} - Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Show remaining count on last image */}
            {index === maxImages - 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{remainingCount} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{propertyTitle}</h2>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <PropertyGallery 
                images={sortedImages} 
                propertyTitle={propertyTitle}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}