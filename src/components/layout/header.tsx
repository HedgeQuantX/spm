'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const NAV_LINKS = [
  { href: '/', label: 'MARKETS', icon: IconTrending },
  { href: '/leaderboard', label: 'LEADERBOARD', icon: IconTrophy },
  { href: '/portfolio', label: 'PORTFOLIO', icon: IconBriefcase },
] as const;

export function Header() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol } = useWalletBalance();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);

  const handleConnect = () => setVisible(true);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-400/10 bg-[#0a0e1a]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <IconSolana size={24} className="text-cyan-400 transition-transform group-hover:scale-110" />
            <span className="text-lg font-bold tracking-widest text-white">
              SPM
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm tracking-wider text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5 transition-all"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6b7db3]">
              <IconDot size={8} className="text-cyan-400 animate-pulse-dot" />
              <span className="font-mono tracking-wider">DEVNET</span>
            </div>

            {/* Wallet */}
            {connected && publicKey ? (
              <div className="relative">
                <button
                  onClick={() => setWalletDropdown(!walletDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f1628] border border-cyan-400/10 hover:border-cyan-400/25 transition-all text-sm"
                >
                  <IconWallet size={14} className="text-cyan-400" />
                  <span className="font-mono text-white tracking-wider">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                  <IconChevronDown size={14} className="text-[#6b7db3]" />
                </button>

                {walletDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setWalletDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0f1628] border border-cyan-400/10 shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-cyan-400/10 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#6b7db3]">SOL</span>
                          <span className="font-mono text-white">{sol.toFixed(4)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#e63973] hover:bg-[#e63973]/5 transition-colors"
                      >
                        <IconDisconnect size={14} />
                        DISCONNECT
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-semibold tracking-wider transition-all hover:shadow-lg hover:shadow-cyan-400/10"
              >
                <IconWallet size={14} />
                CONNECT
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-[#6b7db3] hover:text-cyan-400 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cyan-400/10 bg-[#0a0e1a]/95 backdrop-blur-xl">
          <nav className="p-4 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm tracking-wider text-[#6b7db3] hover:text-cyan-400 hover:bg-cyan-400/5 transition-all"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
