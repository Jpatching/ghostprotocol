import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ActivityEntry {
  id: number;
  action: string;
  detail: string;
  timestamp: string;
}

const ACTION_ICONS: Record<string, string> = {
  scan_complete: "🔍",
  subscription_cancelled: "✅",
  email_generated: "📧",
  solana_tx: "⛓️",
};

const ACTION_LABELS: Record<string, string> = {
  scan_complete: "Scan Complete",
  subscription_cancelled: "Subscription Cancelled",
  email_generated: "Email Generated",
  solana_tx: "Solana Transaction",
};

function relativeTime(ts: string): string {
  try {
    const date = new Date(ts.replace(" ", "T") + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return ts;
  }
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    invoke<ActivityEntry[]>("get_activity_log")
      .then(setActivities)
      .catch(console.error);
  }, []);

  const cancelCount = activities.filter(
    (a) => a.action === "subscription_cancelled"
  ).length;
  const scanCount = activities.filter(
    (a) => a.action === "scan_complete"
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">
          Agent Activity Log
        </h2>
        <p className="text-ghost-muted text-sm">
          Everything Ghost Protocol has done on your behalf.
        </p>
      </div>

      {/* Summary Stats */}
      {activities.length > 0 && (
        <div className="flex gap-3">
          <div className="bg-ghost-card border border-ghost-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm">🔍</span>
            <span className="text-sm text-ghost-text">
              {scanCount} scan{scanCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="bg-ghost-card border border-ghost-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm">✅</span>
            <span className="text-sm text-ghost-text">
              {cancelCount} cancellation{cancelCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="bg-ghost-card border border-ghost-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-sm">📋</span>
            <span className="text-sm text-ghost-text">
              {activities.length} total action{activities.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="bg-ghost-card border border-ghost-border rounded-xl p-6 text-center py-12">
          <div className="text-3xl mb-3">👻</div>
          <p className="text-ghost-muted text-sm">No activity yet.</p>
          <p className="text-ghost-muted text-xs mt-1">
            Cancel a subscription to see agent activity here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((entry) => (
            <div
              key={entry.id}
              className="bg-ghost-card border border-ghost-border rounded-xl p-4 flex items-start gap-3 hover:border-ghost-accent/20 transition-colors duration-200"
            >
              <div className="text-xl mt-0.5">
                {ACTION_ICONS[entry.action] || "📋"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  <span className="text-ghost-muted text-xs" title={entry.timestamp}>
                    {relativeTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-ghost-text text-sm">{entry.detail}</p>
              </div>
              {entry.action === "subscription_cancelled" &&
                entry.detail.includes("on-chain") && (
                  <span className="text-xs bg-ghost-accent/15 text-ghost-accent-light px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-ghost-accent" />
                    Verified
                  </span>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
