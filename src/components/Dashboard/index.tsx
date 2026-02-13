import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import SolanaWallet from "./SolanaWallet";
import CancelModal from "./CancelModal";

interface Subscription {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  merchant: string;
  status: string;
  cancelled_at: string | null;
  cancel_tx: string | null;
}

interface SavingsSummary {
  monthly_saved: number;
  annual_saved: number;
  monthly_active: number;
  annual_active: number;
}

export default function Dashboard() {
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [savings, setSavings] = useState<SavingsSummary | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);

  const loadData = useCallback(() => {
    invoke<string>("get_db_status")
      .then(setDbStatus)
      .catch(() => setDbStatus("Error"));

    invoke<Subscription[]>("get_subscriptions")
      .then(setSubscriptions)
      .catch(console.error);

    invoke<string>("get_savings_summary")
      .then((json) => setSavings(JSON.parse(json)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const cancelledSubs = subscriptions.filter((s) => s.status === "cancelled");

  return (
    <div className="p-6 space-y-6">
      {/* Status Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-ghost-card border border-ghost-border rounded-lg px-4 py-2">
          <div
            className={`h-2 w-2 rounded-full ${
              dbStatus.startsWith("Connected")
                ? "bg-ghost-green"
                : "bg-ghost-yellow animate-pulse"
            }`}
          />
          <span className="text-sm text-ghost-text">Database: {dbStatus}</span>
        </div>
        {savings && savings.monthly_saved > 0 && (
          <div className="flex items-center gap-2 bg-ghost-green/10 border border-ghost-green/30 rounded-lg px-4 py-2">
            <span className="text-sm text-ghost-green font-medium">
              Saving ${savings.monthly_saved.toFixed(2)}/mo ($
              {savings.annual_saved.toFixed(2)}/yr)
            </span>
          </div>
        )}
        {savings && savings.monthly_active > 0 && (
          <div className="flex items-center gap-2 bg-ghost-card border border-ghost-border rounded-lg px-4 py-2">
            <span className="text-sm text-ghost-muted">
              Active: ${savings.monthly_active.toFixed(2)}/mo
            </span>
          </div>
        )}
      </div>

      {/* Active Subscriptions */}
      <div className="bg-ghost-card border border-ghost-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Active Subscriptions ({activeSubs.length})
          </h2>
          <span className="text-xs text-ghost-muted">
            Detected from bank transactions
          </span>
        </div>

        {activeSubs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">🎉</div>
            <p className="text-ghost-green text-sm font-medium">
              All subscriptions cancelled!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between bg-ghost-darker rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-white text-sm font-medium">{sub.name}</p>
                  <p className="text-ghost-muted text-xs">{sub.merchant}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white text-sm font-mono">
                      ${sub.amount.toFixed(2)}
                    </p>
                    <p className="text-ghost-muted text-xs">{sub.frequency}</p>
                  </div>
                  <button
                    onClick={() => setCancelTarget(sub)}
                    className="text-xs bg-ghost-red/20 text-ghost-red px-3 py-1.5 rounded-lg hover:bg-ghost-red/30 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancelled Subscriptions */}
      {cancelledSubs.length > 0 && (
        <div className="bg-ghost-card border border-ghost-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Cancelled ({cancelledSubs.length})
          </h2>
          <div className="space-y-2">
            {cancelledSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between bg-ghost-darker rounded-lg px-4 py-3 opacity-60"
              >
                <div>
                  <p className="text-white text-sm font-medium line-through">
                    {sub.name}
                  </p>
                  <p className="text-ghost-muted text-xs">{sub.merchant}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-ghost-green text-sm font-mono">
                      -${sub.amount.toFixed(2)}
                    </p>
                    <p className="text-ghost-muted text-xs">saved</p>
                  </div>
                  {sub.cancel_tx && (
                    <a
                      href={`https://explorer.solana.com/tx/${sub.cancel_tx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ghost-accent-light hover:underline"
                    >
                      On-chain proof
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solana Wallet */}
      <SolanaWallet />

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          subscription={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={() => {
            setCancelTarget(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
