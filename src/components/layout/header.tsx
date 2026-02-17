'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/cn';
import { truncateAddress } from '@/lib/format';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { useWsStatus } from '@/hooks/use-ws-status';
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
  { href: '/', label: 'Markets', icon: IconTrending },
  { href: '/leaderboard', label: 'Leaderboard', icon: IconTrophy },
  { href: '/portfolio', label: 'Portfolio', icon: IconBriefcase },
] as const;

export function Header() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { sol, usdc } = useWalletBalance();
  const wsConnected = useWsStatus();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);

  const handleConnect = () => setVisible(true);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <IconSolana size={24} className="transition-transform group-hover:scale-110" />
            <span className="text-lg font-bold tracking-tight text-white">
              SPM
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* WS Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
              <IconDot
                size={8}
                className={wsConnected ? 'text-emerald-400' : 'text-rose-400'}
              />
              <span className="font-mono">{wsConnected ? 'Live' : 'Offline'}</span>
            </div>

            {/* Wallet */}
            {connected && publicKey ? (
              <div className="relative">
                <button
                  onClick={() => setWalletDropdown(!walletDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all text-sm"
                >
                  <IconWallet size={14} className="text-zinc-400" />
                  <span className="font-mono text-white">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                  <IconChevronDown size={14} className="text-zinc-500" />
                </button>

                {walletDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setWalletDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-zinc-800 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">SOL</span>
                          <span className="font-mono text-white">{sol.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">USDC</span>
                          <span className="font-mono text-white">{usdc.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-zinc-800/50 transition-colors"
                      >
                        <IconDisconnect size={14} />
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20"
              >
                <IconWallet size={14} />
                Connect
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl">
          <nav className="p-4 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
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
