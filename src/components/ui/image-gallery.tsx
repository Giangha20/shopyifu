'use client';

import * as React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';

export interface ImageGalleryItem {
  id?: string | number;
  url: string;
  alt?: string;
}

export interface ImageGalleryProps {
  images: ImageGalleryItem[] | string[];
  aspectRatio?: 'square' | 'portrait' | 'wide';
  className?: string;
  enableZoom?: boolean;
}

export function ImageGallery({
  images,
  aspectRatio = 'portrait',
  className,
  enableZoom = true,
}: ImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = React.useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Desktop Hover Zoom State
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = React.useState(false);

  // Normalize image data
  const normalizedImages: ImageGalleryItem[] = React.useMemo(() => {
    if (!images || images.length === 0) {
      return [{ url: '/placeholder-product.jpg', alt: 'Hình ảnh sản phẩm' }];
    }
    return images.map((img, i) => {
      if (typeof img === 'string') {
        return { id: i, url: img, alt: `Hình ảnh ${i + 1}` };
      }
      return { id: img.id ?? i, url: img.url, alt: img.alt || `Hình ảnh ${i + 1}` };
    });
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)',
    });
  };

  const handleMouseEnter = () => {
    if (enableZoom) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  };

  const aspectClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[4/3]',
  }[aspectRatio];

  return (
    <div className={cn('flex flex-col gap-4 w-full select-none', className)}>
      {/* Main Image Viewport */}
      <div className="relative group overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-luxury">
        <Swiper
          spaceBetween={10}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs, Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full h-full"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {normalizedImages.map((image, index) => (
            <SwiperSlide key={image.id || index}>
              <div
                className={cn('relative w-full overflow-hidden cursor-crosshair', aspectClass)}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="relative w-full h-full transition-transform duration-100 ease-out"
                  style={isHovered ? zoomStyle : undefined}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || 'Ảnh sản phẩm'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                    className="object-cover object-center pointer-events-none"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-luxury-black shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Xem toàn màn hình"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnails list */}
      {normalizedImages.length > 1 && (
        <div className="w-full">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={12}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            breakpoints={{
              640: { slidesPerView: 5 },
              1024: { slidesPerView: 6 },
            }}
            className="w-full"
          >
            {normalizedImages.map((image, index) => {
              const isSelected = activeIndex === index;
              return (
                <SwiperSlide key={image.id || index}>
                  <button
                    type="button"
                    className={cn(
                      'relative block aspect-[3/4] w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none',
                      isSelected
                        ? 'border-luxury-gold shadow-glow ring-2 ring-luxury-gold/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                    aria-label={`Chọn ảnh ${index + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover object-center"
                    />
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95 focus:outline-none"
            aria-label="Đóng toàn màn hình"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center">
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1))
                }
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image
                src={normalizedImages[activeIndex]?.url}
                alt={normalizedImages[activeIndex]?.alt || 'Ảnh chi tiết'}
                fill
                priority
                className="object-contain"
              />
            </div>

            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
