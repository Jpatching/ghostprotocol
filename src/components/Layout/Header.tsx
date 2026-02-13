import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Stats {
  active_count: number;
  cancelled_count: number;
  active_monthly: number;
  saved_monthly: number;
  saved_annual: number;
  solana_tx_count: number;
}

export default function Header() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    invoke<string>("get_stats")
      .then((json) => setStats(JSON.parse(json)))
      .catch(console.error);
  }, []);

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
        <div className="flex items-center gap-4">
          {stats && stats.solana_tx_count > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-ghost-accent-light">
              <div className="h-1.5 w-1.5 rounded-full bg-ghost-accent animate-pulse" />
              {stats.solana_tx_count} on-chain tx{stats.solana_tx_count !== 1 ? "s" : ""}
            </div>
          )}
          {stats && stats.saved_monthly > 0 && (
            <div className="text-xs text-ghost-green font-medium">
              ${stats.saved_annual.toFixed(0)}/yr saved
            </div>
          )}
          <div className="text-xs text-ghost-muted">Local-First AI Agent</div>
        </div>
      </div>
    </header>
  );
}
