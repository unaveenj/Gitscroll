import { DarkModeToggle } from "./DarkModeToggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight">GitScroll</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Discover repos you&apos;ll love
        </span>
      </div>
      <DarkModeToggle />
    </header>
  );
}
