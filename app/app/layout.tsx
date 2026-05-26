import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { ConnectButton } from "@/components/wallet/connect-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-40 border-b hairline bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Logo />
              <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
                <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
                arbitrum one · live
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors"
              >
                ← Back to site
              </Link>
              <ConnectButton size="sm" redirectOnConnect={false} />
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
