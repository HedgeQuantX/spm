import { IconSolana, IconTwitter, IconTelegram, IconExternalLink } from '@/components/icons';
import { ENV } from '@/config/env';

export function Footer() {
  const explorerUrl = `https://solscan.io/account/${ENV.PROGRAM_ID}?cluster=devnet`;

  return (
    <footer className="hidden sm:block shrink-0 border-t border-cyan-400/10 glass-bar">
      <div className="px-5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.1em] font-bold">
          <IconSolana size={12} className="text-cyan-400" />
          <span className="text-cyan-400">SPM</span>
          <span className="text-[#4a5a8a]">--</span>
          <span className="text-yellow-400">SOLANA PREDICTION MARKETS</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] tracking-[0.1em] font-bold text-[#6b7db3]">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            PROGRAM <IconExternalLink size={9} />
          </a>
          <span className="text-[#1e2d58]">|</span>
          <a
            href="https://x.com/hedgequantx"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            <IconTwitter size={13} />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            <IconTelegram size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
