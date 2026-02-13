export default function Header() {
  return (
    <header className="border-b border-ghost-border bg-ghost-darker px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-ghost-accent flex items-center justify-center text-white font-bold text-sm">
            GP
          </div>
          <h1 className="text-xl font-bold text-white">Ghost Protocol</h1>
          <span className="text-xs text-ghost-muted bg-ghost-card px-2 py-0.5 rounded">
            v0.1.0
          </span>
        </div>
        <div className="text-xs text-ghost-muted">Local-First AI Agent</div>
      </div>
    </header>
  );
}
