import { useEffect, useRef, useState } from "react";

export function useHeaderVisibility(hideDelayMs = 4000) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function hideHeaderIfNotTop() {
      // If we haven't scrolled back to the very top, hide header.
      if (window.scrollY > 0) {
        setIsVisible(false);
      }
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Check scroll direction
      if (currentScrollY < lastScrollYRef.current) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current) {
        // Scrolling down
        setIsVisible(false);
      }
      lastScrollYRef.current = currentScrollY;

      // Reset inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(hideHeaderIfNotTop, hideDelayMs);
    }

    // Attach scroll listener to window or your scroll container
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [hideDelayMs]);

  return isVisible;
}
