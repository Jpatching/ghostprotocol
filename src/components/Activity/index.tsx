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

export default function Activity() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    invoke<ActivityEntry[]>("get_activity_log")
      .then(setActivities)
      .catch(console.error);
  }, []);

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
              className="bg-ghost-card border border-ghost-border rounded-xl p-4 flex items-start gap-3"
            >
              <div className="text-xl mt-0.5">
                {ACTION_ICONS[entry.action] || "📋"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">
                    {ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  <span className="text-ghost-muted text-xs">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-ghost-text text-sm">{entry.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
