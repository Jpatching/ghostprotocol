import { useEffect, useState, useCallback } from "react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const DEVNET_URL = "https://api.devnet.solana.com";

interface WalletState {
  publicKey: string | null;
  balance: number | null;
  status: "disconnected" | "connecting" | "connected" | "error";
  error: string | null;
}

export default function SolanaWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null,
    balance: null,
    status: "disconnected",
    error: null,
  });
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [airdropping, setAirdropping] = useState(false);
  const [connection] = useState(() => new Connection(DEVNET_URL, "confirmed"));

  const connectWallet = useCallback(async () => {
    setWallet((w) => ({ ...w, status: "connecting", error: null }));
    try {
      // Check localStorage for existing keypair
      const stored = localStorage.getItem("ghost_wallet_secret");
      let kp: Keypair;
      if (stored) {
        kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(stored)));
      } else {
        kp = Keypair.generate();
        localStorage.setItem(
          "ghost_wallet_secret",
          JSON.stringify(Array.from(kp.secretKey))
        );
      }
      setKeypair(kp);

      const balance = await connection.getBalance(kp.publicKey);
      setWallet({
        publicKey: kp.publicKey.toBase58(),
        balance: balance / LAMPORTS_PER_SOL,
        status: "connected",
        error: null,
      });
    } catch (err) {
      setWallet((w) => ({
        ...w,
        status: "error",
        error: err instanceof Error ? err.message : "Connection failed",
      }));
    }
  }, [connection]);

  const requestAirdrop = async () => {
    if (!keypair) return;
    setAirdropping(true);
    try {
      const sig = await connection.requestAirdrop(
        keypair.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(sig, "confirmed");
      const balance = await connection.getBalance(keypair.publicKey);
      setWallet((w) => ({
        ...w,
        balance: balance / LAMPORTS_PER_SOL,
      }));
    } catch (err) {
      console.error("Airdrop failed:", err);
    } finally {
      setAirdropping(false);
    }
  };

  const refreshBalance = async () => {
    if (!keypair) return;
    try {
      const balance = await connection.getBalance(keypair.publicKey);
      setWallet((w) => ({ ...w, balance: balance / LAMPORTS_PER_SOL }));
    } catch (err) {
      console.error("Balance refresh failed:", err);
    }
  };

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  const truncateKey = (key: string) =>
    `${key.slice(0, 6)}...${key.slice(-4)}`;

  return (
    <div className="bg-ghost-card border border-ghost-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          Solana Wallet (Devnet)
        </h2>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              wallet.status === "connected"
                ? "bg-ghost-green"
                : wallet.status === "connecting"
                  ? "bg-ghost-yellow animate-pulse"
                  : wallet.status === "error"
                    ? "bg-ghost-red"
                    : "bg-ghost-muted"
            }`}
          />
          <span className="text-xs text-ghost-muted capitalize">
            {wallet.status}
          </span>
        </div>
      </div>

      {wallet.status === "connected" && wallet.publicKey ? (
        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="bg-ghost-darker rounded-lg px-4 py-3">
            <p className="text-xs text-ghost-muted mb-1">Wallet Address</p>
            <p className="text-sm text-white font-mono">
              {truncateKey(wallet.publicKey)}
            </p>
          </div>

          {/* Balance */}
          <div className="bg-ghost-darker rounded-lg px-4 py-3">
            <p className="text-xs text-ghost-muted mb-1">Balance</p>
            <div className="flex items-center justify-between">
              <p className="text-lg text-white font-mono">
                {wallet.balance !== null
                  ? `${wallet.balance.toFixed(4)} SOL`
                  : "Loading..."}
              </p>
              <button
                onClick={refreshBalance}
                className="text-xs text-ghost-accent-light hover:text-ghost-accent transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={requestAirdrop}
              disabled={airdropping}
              className={`flex-1 text-sm px-4 py-2 rounded-lg transition ${
                airdropping
                  ? "bg-ghost-accent/20 text-ghost-muted cursor-not-allowed"
                  : "bg-ghost-accent text-white hover:bg-ghost-accent/80"
              }`}
            >
              {airdropping ? "Requesting..." : "Request 1 SOL Airdrop"}
            </button>
          </div>

          {/* Token Info */}
          <div className="bg-ghost-darker rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ghost-muted mb-1">$GHOST Tokens</p>
                <p className="text-sm text-white font-mono">0</p>
              </div>
              <span className="text-xs text-ghost-muted bg-ghost-card px-2 py-1 rounded">
                Earn by cancelling subscriptions
              </span>
            </div>
          </div>
        </div>
      ) : wallet.status === "connecting" ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3 animate-pulse">⛓️</div>
          <p className="text-ghost-muted text-sm">
            Connecting to Solana Devnet...
          </p>
        </div>
      ) : wallet.status === "error" ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-ghost-red text-sm">{wallet.error}</p>
          <button
            onClick={connectWallet}
            className="mt-3 text-sm text-ghost-accent-light hover:text-ghost-accent transition"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <button
            onClick={connectWallet}
            className="bg-ghost-accent text-white px-6 py-2 rounded-lg hover:bg-ghost-accent/80 transition"
          >
            Connect to Devnet
          </button>
        </div>
      )}
    </div>
  );
}
