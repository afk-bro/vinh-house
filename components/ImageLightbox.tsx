"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  images: { src: string; alt: string }[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export default function ImageLightbox({ images, currentIndex, onClose, onNext, onPrevious }: Props) {
  const currentImage = images[currentIndex];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard: Esc closes, arrows navigate, Tab is trapped within the dialog.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return onNext();
      if (e.key === "ArrowLeft") return onPrevious();
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  // Lock body scroll, move focus into the dialog, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={currentImage.alt || "Image gallery"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[var(--color-primary-dark)] shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-105 transition-all"
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[var(--color-primary-dark)] shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-105 transition-all"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 text-[var(--color-primary-dark)] shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-105 transition-all"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image container - click to close */}
      <div
        onClick={onClose}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-16"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-7xl max-h-full w-full h-full flex flex-col items-center justify-center"
        >
          {/* Image */}
          <div className="relative w-full h-full">
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Image caption */}
          {currentImage.alt && (
            <div className="mt-4 text-center">
              <p className="text-accent-beige/90 text-sm sm:text-base">
                {currentImage.alt}
              </p>
              <p className="text-accent-beige/50 text-xs mt-1">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
