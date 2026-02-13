import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

const DEVNET_URL = "https://api.devnet.solana.com";
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

interface CancelResult {
  id: number;
  email_subject: string;
  email_body: string;
}

interface Props {
  subscription: {
    id: number;
    name: string;
    amount: number;
    merchant: string;
  };
  onClose: () => void;
  onCancelled: () => void;
}

export default function CancelModal({
  subscription,
  onClose,
  onCancelled,
}: Props) {
  const [step, setStep] = useState<
    "generating" | "review" | "signing" | "done" | "error"
  >("generating");
  const [cancelResult, setCancelResult] = useState<CancelResult | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate cancellation email on mount
  useState(() => {
    invoke<CancelResult>("cancel_subscription", { id: subscription.id })
      .then((result) => {
        setCancelResult(result);
        setStep("review");
      })
      .catch((err) => {
        setError(String(err));
        setStep("error");
      });
  });

  const signAndConfirm = async () => {
    setStep("signing");
    try {
      // Get keypair from localStorage
      const stored = localStorage.getItem("ghost_wallet_secret");
      if (!stored) {
        throw new Error("No wallet found. Connect your Solana wallet first.");
      }
      const keypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(stored))
      );
      const connection = new Connection(DEVNET_URL, "confirmed");

      // Check balance
      const balance = await connection.getBalance(keypair.publicKey);
      if (balance < 0.001 * LAMPORTS_PER_SOL) {
        throw new Error(
          "Insufficient SOL balance. Request an airdrop first."
        );
      }

      // Create memo transaction as proof of cancellation
      const memo = JSON.stringify({
        action: "cancel_subscription",
        subscription: subscription.name,
        amount: subscription.amount,
        merchant: subscription.merchant,
        timestamp: new Date().toISOString(),
        agent: "ghost-protocol",
      });

      const transaction = new Transaction().add(
        new TransactionInstruction({
          keys: [
            {
              pubkey: keypair.publicKey,
              isSigner: true,
              isWritable: true,
            },
          ],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memo),
        })
      );

      transaction.feePayer = keypair.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.sign(keypair);

      const sig = await connection.sendRawTransaction(
        transaction.serialize()
      );
      await connection.confirmTransaction(sig, "confirmed");

      setTxSignature(sig);

      // Confirm in database
      await invoke("confirm_cancellation", {
        id: subscription.id,
        txSignature: sig,
      });

      setStep("done");
      onCancelled();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("error");
    }
  };

  const skipSolana = async () => {
    try {
      await invoke("confirm_cancellation", {
        id: subscription.id,
        txSignature: null,
      });
      setStep("done");
      onCancelled();
    } catch (err) {
      setError(String(err));
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-ghost-card border border-ghost-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ghost-border">
          <h2 className="text-lg font-semibold text-white">
            Cancel {subscription.name}
          </h2>
          <button
            onClick={onClose}
            className="text-ghost-muted hover:text-white transition text-xl"
          >
            x
          </button>
        </div>

        <div className="p-6">
          {step === "generating" && (
            <div className="text-center py-8">
              <div className="text-3xl mb-3 animate-pulse">🤖</div>
              <p className="text-ghost-text">
                Generating cancellation email...
              </p>
            </div>
          )}

          {step === "review" && cancelResult && (
            <div className="space-y-4">
              <div className="bg-ghost-darker rounded-lg p-4">
                <p className="text-xs text-ghost-muted mb-1">Subject</p>
                <p className="text-sm text-white font-medium">
                  {cancelResult.email_subject}
                </p>
              </div>
              <div className="bg-ghost-darker rounded-lg p-4">
                <p className="text-xs text-ghost-muted mb-2">Email Body</p>
                <pre className="text-sm text-ghost-text whitespace-pre-wrap font-sans leading-relaxed">
                  {cancelResult.email_body}
                </pre>
              </div>
              <div className="bg-ghost-accent/10 border border-ghost-accent/30 rounded-lg p-4">
                <p className="text-sm text-ghost-accent-light">
                  Signing this cancellation on Solana creates an immutable
                  on-chain receipt — proof that you requested cancellation on
                  this date.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={signAndConfirm}
                  className="flex-1 bg-ghost-accent text-white px-4 py-3 rounded-lg hover:bg-ghost-accent/80 transition font-medium"
                >
                  Sign on Solana & Cancel
                </button>
                <button
                  onClick={skipSolana}
                  className="px-4 py-3 rounded-lg border border-ghost-border text-ghost-muted hover:text-white transition"
                >
                  Cancel without proof
                </button>
              </div>
            </div>
          )}

          {step === "signing" && (
            <div className="text-center py-8">
              <div className="text-3xl mb-3 animate-spin">⛓️</div>
              <p className="text-ghost-text">
                Signing transaction on Solana Devnet...
              </p>
              <p className="text-ghost-muted text-xs mt-2">
                Creating on-chain proof of cancellation
              </p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-white font-medium text-lg">
                {subscription.name} Cancelled!
              </p>
              <p className="text-ghost-green text-sm">
                Saving ${subscription.amount.toFixed(2)}/month ($
                {(subscription.amount * 12).toFixed(2)}/year)
              </p>
              {txSignature && (
                <div className="bg-ghost-darker rounded-lg p-4 text-left">
                  <p className="text-xs text-ghost-muted mb-1">
                    Solana Transaction (Devnet)
                  </p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ghost-accent-light hover:underline font-mono break-all"
                  >
                    {txSignature}
                  </a>
                </div>
              )}
              <button
                onClick={onClose}
                className="bg-ghost-accent text-white px-6 py-2 rounded-lg hover:bg-ghost-accent/80 transition"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-ghost-red text-sm">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("review")}
                  className="text-sm text-ghost-accent-light hover:text-ghost-accent transition"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="text-sm text-ghost-muted hover:text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
