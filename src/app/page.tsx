'use client';

import { useState } from 'react';
import { Header, type Tab } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MarketsSection } from '@/components/sections/markets-section';
import { LeaderboardSection } from '@/components/sections/leaderboard-section';
import { PortfolioSection } from '@/components/sections/portfolio-section';
import { MarketDetailPanel } from '@/components/market/market-detail-panel';
import type { Market } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('markets');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  return (
    <div id="app-shell" className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Header — fixed height */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content — fills remaining space */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === 'markets' && (
          <MarketsSection onSelectMarket={setSelectedMarket} />
        )}
        {activeTab === 'leaderboard' && <LeaderboardSection />}
        {activeTab === 'portfolio' && <PortfolioSection />}
      </main>

      {/* Footer — fixed height, desktop only */}
      <Footer />

      {/* Market Detail Slide-Over */}
      {selectedMarket && (
        <MarketDetailPanel
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}
    </div>
  );
}
