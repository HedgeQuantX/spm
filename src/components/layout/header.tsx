'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/cn';
import { truncateAddress } from '@/lib/format';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import {
  IconWallet,
  IconMenu,
  IconX,
  IconTrending,
  IconTrophy,
  IconBriefcase,
  IconDot,
  IconSolana,
  IconChevronDown,
  IconDisconnect,
} from '@/components/icons';

export type Tab = 'markets' | 'leaderboard' | 'portfolio';

const NAV_TABS: { id: Tab; label: string; icon: typeof IconTrending }[] = [
  { id: 'markets', label: 'MARKETS', icon: IconTrending },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: IconTrophy },
  { id: 'portfolio', label: 'PORTFOLIO', icon: IconBriefcase },
];

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol } = useWalletBalance();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);

  const handleConnect = () => setVisible(true);

  return (
    <header className="h-12 shrink-0 border-b border-cyan-400/10 glass-bar z-50">
      <div className="h-full px-3 sm:px-5 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => onTabChange('markets')}
            className="flex items-center gap-1.5 group"
          >
            <IconSolana size={18} className="text-cyan-400 transition-transform group-hover:scale-110" />
            <span className="text-[15px] sm:text-[17px] font-bold tracking-[0.08em] text-white">
              SPM
            </span>
          </button>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] tracking-[0.12em] font-bold transition-all',
                  activeTab === id
                    ? 'text-cyan-400 bg-cyan-400/8'
                    : 'text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5',
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#6b7db3]">
            <IconDot size={6} className="text-cyan-400 animate-pulse-dot" />
            <span className="font-mono tracking-[0.12em] font-bold">DEVNET</span>
          </div>

          {/* Wallet */}
          {connected && publicKey ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropdown(!walletDropdown)}
                className="h-8 flex items-center gap-1.5 px-2.5 border border-cyan-400/10 bg-[#0f1628] hover:border-cyan-400/25 transition-all text-[11px]"
              >
                <IconWallet size={12} className="text-cyan-400" />
                <span className="font-mono text-white tracking-wider">
                  {truncateAddress(publicKey.toBase58())}
                </span>
                <IconChevronDown size={12} className="text-[#6b7db3]" />
              </button>

              {walletDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWalletDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[#0f1628] border border-cyan-400/10 shadow-2xl z-50 overflow-hidden">
                    <div className="p-2.5 border-b border-cyan-400/10">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#6b7db3] tracking-wider">SOL</span>
                        <span className="font-mono text-white">{sol.toFixed(4)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setWalletDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] text-[#e63973] hover:bg-[#e63973]/5 transition-colors tracking-wider"
                    >
                      <IconDisconnect size={12} />
                      DISCONNECT
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="h-8 flex items-center gap-1.5 px-3 border border-cyan-400/20 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 hover:from-violet-500/30 hover:to-cyan-500/30 text-white text-[11px] font-bold tracking-[0.1em] transition-all"
            >
              <IconWallet size={12} />
              CONNECT
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1.5 text-[#6b7db3] hover:text-cyan-400 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <IconX size={16} /> : <IconMenu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cyan-400/10 glass-bar">
          <nav className="p-3 space-y-0.5">
            {NAV_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onTabChange(id);
                  setMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-[11px] tracking-[0.12em] font-bold transition-all',
                  activeTab === id
                    ? 'text-cyan-400 bg-cyan-400/8'
                    : 'text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5',
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
