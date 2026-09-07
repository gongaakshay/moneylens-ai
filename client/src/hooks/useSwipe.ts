import { useState, useRef, useEffect, TouchEvent } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

interface SwipeState {
  isSwiping: boolean;
  swipeProgress: number;
  direction: "left" | "right" | null;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
}: UseSwipeOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeProgress: 0,
    direction: null,
  });

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchCurrent = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchCurrent.current = touchStart.current;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;

    touchCurrent.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = Math.abs(touchCurrent.current.y - touchStart.current.y);

    // Only consider horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      
      const direction = deltaX < 0 ? "left" : "right";
      const progress = Math.min(Math.abs(deltaX), threshold);

      setSwipeState({
        isSwiping: true,
        swipeProgress: direction === "left" ? -progress : progress,
        direction,
      });
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchCurrent.current) return;

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const absDeltaX = Math.abs(deltaX);

    // Trigger callback if threshold is met
    if (absDeltaX >= threshold) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Reset state with animation
    setSwipeState({
      isSwiping: false,
      swipeProgress: 0,
      direction: null,
    });

    touchStart.current = null;
    touchCurrent.current = null;
  };

  // Reset on unmount
  useEffect(() => {
    return () => {
      touchStart.current = null;
      touchCurrent.current = null;
    };
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swipeState,
    resetSwipe: () =>
      setSwipeState({
        isSwiping: false,
        swipeProgress: 0,
        direction: null,
      }),
  };
}

