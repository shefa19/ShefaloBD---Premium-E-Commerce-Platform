import { useEffect } from 'react';

let lockCount = 0;
let originalPaddingRight = '';

/**
 * Hook to safely lock body scroll with global reference counting.
 * Prevents nested modals from locking the body permanently when unmounting or navigating back.
 */
export function useLockBodyScroll(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    if (lockCount === 0) {
      originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = originalPaddingRight || '';
      }
    };
  }, [isLocked]);
}

/**
 * Utility to force unlock body scroll if needed
 */
export function forceUnlockBodyScroll() {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
