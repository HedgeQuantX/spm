import { IconSolana, IconTwitter, IconTelegram } from '@/components/icons';

export function Footer() {
  return (
    <footer className="border-t border-cyan-400/10 bg-[#060a14]/50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#6b7db3] text-xs tracking-wider">
            <IconSolana size={14} className="text-cyan-400" />
            <span>SPM PROTOCOL -- BUILT ON SOLANA</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b7db3] hover:text-cyan-400 transition-colors"
            >
              <IconTwitter size={16} />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6b7db3] hover:text-cyan-400 transition-colors"
            >
              <IconTelegram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
