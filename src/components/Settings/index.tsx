import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ApiKeyEntry {
  service: string;
  has_key: boolean;
  created_at: string | null;
}

const SERVICE_INFO: Record<string, { label: string; description: string; placeholder: string }> = {
  claude: {
    label: "Claude API (Anthropic)",
    description: "Powers AI subscription detection and cancellation email generation",
    placeholder: "sk-ant-...",
  },
  plaid: {
    label: "Plaid API",
    description: "Connects to your bank to fetch transactions securely",
    placeholder: "access-sandbox-...",
  },
  solana_rpc: {
    label: "Solana RPC (Helius)",
    description: "Custom RPC endpoint for faster Solana transactions",
    placeholder: "https://devnet.helius-rpc.com/?api-key=...",
  },
};

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadKeys = () => {
    invoke<ApiKeyEntry[]>("get_api_keys")
      .then(setApiKeys)
      .catch(console.error);
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const saveKey = async (service: string) => {
    if (!inputValue.trim()) return;
    setSaving(true);
    try {
      await invoke("save_api_key", { service, key: inputValue.trim() });
      setEditing(null);
      setInputValue("");
      loadKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (service: string) => {
    try {
      await invoke("delete_api_key", { service });
      loadKeys();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Settings</h2>
        <p className="text-ghost-muted text-sm">
          API keys are stored locally in your SQLite database. They never leave your machine.
        </p>
      </div>

      <div className="space-y-4">
        {(Object.keys(SERVICE_INFO) as string[]).map((service) => {
          const info = SERVICE_INFO[service];
          const entry = apiKeys.find((k) => k.service === service);
          const hasKey = entry?.has_key ?? false;

          return (
            <div
              key={service}
              className="bg-ghost-card border border-ghost-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm">
                      {info.label}
                    </h3>
                    {hasKey && (
                      <span className="text-xs bg-ghost-green/20 text-ghost-green px-2 py-0.5 rounded">
                        Configured
                      </span>
                    )}
                  </div>
                  <p className="text-ghost-muted text-xs mt-1">
                    {info.description}
                  </p>
                </div>
                {hasKey && editing !== service && (
                  <button
                    onClick={() => deleteKey(service)}
                    className="text-xs text-ghost-red hover:text-ghost-red/80 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              {editing === service ? (
                <div className="flex gap-2 mt-3">
                  <input
                    type="password"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={info.placeholder}
                    className="flex-1 bg-ghost-darker border border-ghost-border rounded-lg px-3 py-2 text-sm text-white placeholder-ghost-muted focus:outline-none focus:border-ghost-accent"
                  />
                  <button
                    onClick={() => saveKey(service)}
                    disabled={saving}
                    className="bg-ghost-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-ghost-accent/80 transition disabled:opacity-50"
                  >
                    {saving ? "..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(null);
                      setInputValue("");
                    }}
                    className="text-ghost-muted px-3 py-2 text-sm hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                !hasKey && (
                  <button
                    onClick={() => setEditing(service)}
                    className="mt-3 text-sm text-ghost-accent-light hover:text-ghost-accent transition"
                  >
                    + Add API Key
                  </button>
                )
              )}

              {hasKey && entry?.created_at && (
                <p className="text-ghost-muted text-xs mt-2">
                  Added: {entry.created_at}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Location */}
      <div className="bg-ghost-card border border-ghost-border rounded-xl p-5">
        <h3 className="text-white font-medium text-sm mb-2">Data Storage</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-ghost-muted text-xs">Database</span>
            <span className="text-ghost-text text-xs font-mono">
              ~/.local/share/com.ghostprotocol.desktop/ghost_protocol.db
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ghost-muted text-xs">Solana Wallet</span>
            <span className="text-ghost-text text-xs font-mono">
              localStorage (browser)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ghost-muted text-xs">Network</span>
            <span className="text-ghost-text text-xs font-mono">
              Solana Devnet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
