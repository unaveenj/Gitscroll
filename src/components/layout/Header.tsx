import Link from "next/link";
import { Bookmark } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 border-b border-border"
      style={{
        height: "var(--header-height)",
        background: "var(--header-bg)",
        backdropFilter: "blur(24px) saturate(1.5)",
        WebkitBackdropFilter: "blur(24px) saturate(1.5)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-bold tracking-tight text-foreground leading-none">
          Git<span style={{ color: "#00e5cc" }}>Scroll</span>
        </span>
        <span className="hidden sm:block h-3.5 w-px bg-border" />
        <span className="hidden sm:block font-code text-[10px] text-muted-foreground/45 tracking-[0.18em] uppercase">
          discover hidden gems
        </span>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-0.5">
        <Link
          href="/"
          className="font-code text-[11px] text-muted-foreground/55 hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05]"
        >
          ~/home
        </Link>
        <Link
          href="/favorites"
          className="flex items-center gap-1.5 font-code text-[11px] text-muted-foreground/55 hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05]"
          aria-label="View favourites"
        >
          <Bookmark className="h-3 w-3" />
          ~/saved
        </Link>
        <div className="h-3.5 w-px bg-border mx-1.5" />
        <DarkModeToggle />
      </div>
    </header>
  );
}
