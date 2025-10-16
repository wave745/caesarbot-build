"use client"

import { useEffect } from "react";
import { useScanner } from "@/stores/scanner";

export default function KeyboardShortcuts() {
  const { setQuery, filters, setFilters } = useScanner();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with /
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Open command board with 'c'
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const commandButton = document.querySelector('button[title="Open commands"]') as HTMLButtonElement;
        if (commandButton) {
          commandButton.click();
        }
      }

      // Switch categories with arrow keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const categories = ["top", "wallets", "early", "security", "socials", "bundles"];
        const currentIndex = categories.indexOf(filters.group);
        let newIndex;
        
        if (e.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
        } else {
          newIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
        }
        
        setFilters({ group: categories[newIndex] as any });
      }

      // Open first token card with Enter
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        const firstCard = document.querySelector('[data-token-card]') as HTMLElement;
        if (firstCard) {
          firstCard.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filters.group, setFilters]);

  return null; // This component doesn't render anything
}

