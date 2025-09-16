"use client"

import { useEffect, useState } from "react";
import TokenCard from "@/components/scanner/TokenCard";
import TokenDrawer from "@/components/scanner/TokenDrawer";
import TopControls from "@/components/scanner/TopControls";
import SkeletonCard from "@/components/scanner/SkeletonCard";
import EmptyState from "@/components/scanner/EmptyState";
import KeyboardShortcuts from "@/components/scanner/KeyboardShortcuts";
import BasicTokenDisplay from "@/components/scanner/BasicTokenDisplay";
import AdvancedAnalysis from "@/components/scanner/AdvancedAnalysis";
import { useScanner } from "@/stores/scanner";

export function ScannerContent() {
  const { selectedToken, setQuery, query } = useScanner();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <KeyboardShortcuts />
      <div className="flex">
        <main className="flex-1 p-6 space-y-6">
          {/* Top Controls */}
          <TopControls />
          
          {/* Basic Token Display - Shows when user searches */}
          <BasicTokenDisplay />
          
          {/* Advanced Analysis - Shows when user selects a feature */}
          <AdvancedAnalysis />
          
          {/* Single Token Card - Shows when token is selected */}
          {selectedToken && (
            <section className="max-w-md">
              <TokenCard t={selectedToken} />
            </section>
          )}

          {/* Empty State - Shows when no token is selected */}
          {!selectedToken && !query && (
            <EmptyState />
          )}
        </main>
        <TokenDrawer />
      </div>
    </>
  );
}
