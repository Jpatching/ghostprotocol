import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Subscription {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  merchant: string;
  status: string;
}

export default function Dashboard() {
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    invoke<string>("get_db_status")
      .then(setDbStatus)
      .catch(() => setDbStatus("Error"));

    invoke<Subscription[]>("get_subscriptions")
      .then(setSubscriptions)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Status Bar */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Subscriptions Section */}
      <div className="bg-ghost-card border border-ghost-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Subscriptions</h2>
          <button
            disabled
            className="text-sm bg-ghost-accent/20 text-ghost-accent-light px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
          >
            Connect Bank (Coming Soon)
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👻</div>
            <p className="text-ghost-muted text-sm">
              No subscriptions detected yet.
            </p>
            <p className="text-ghost-muted text-xs mt-1">
              Connect your bank account to find hidden subscriptions.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between bg-ghost-darker rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-white text-sm font-medium">{sub.name}</p>
                  <p className="text-ghost-muted text-xs">{sub.merchant}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-mono">
                    ${sub.amount.toFixed(2)}
                  </p>
                  <p className="text-ghost-muted text-xs">{sub.frequency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solana Integration Preview */}
      <div className="bg-ghost-card border border-ghost-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Solana Integration
        </h2>
        <div className="text-center py-8">
          <div className="text-3xl mb-3">⛓️</div>
          <p className="text-ghost-muted text-sm">
            Receipt NFTs and $GHOST token rewards coming soon.
          </p>
          <p className="text-ghost-muted text-xs mt-1">
            Powered by Solana for on-chain proof of savings.
          </p>
        </div>
      </div>
    </div>
  );
}
