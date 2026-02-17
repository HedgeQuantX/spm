import { IconSolana, IconTwitter, IconTelegram } from '@/components/icons';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <IconSolana size={14} />
            <span>SPM Protocol &middot; Built on Solana</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <IconTwitter size={16} />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <IconTelegram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
