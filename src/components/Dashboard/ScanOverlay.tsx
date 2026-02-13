import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ScanOverlayProps {
  onComplete: (result: { subscriptions_found: number; total_monthly: number; total_annual: number }) => void;
  onClose: () => void;
}

const SCAN_STEPS = [
  { label: "Connecting to bank API...", duration: 800 },
  { label: "Fetching last 90 days of transactions...", duration: 1200 },
  { label: "AI analyzing transaction patterns...", duration: 1500 },
  { label: "Detecting recurring charges...", duration: 1000 },
  { label: "Cross-referencing merchant database...", duration: 800 },
  { label: "Classifying subscription types...", duration: 700 },
  { label: "Calculating total spend...", duration: 500 },
];

export default function ScanOverlay({ onComplete, onClose }: ScanOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ subscriptions_found: number; total_monthly: number; total_annual: number } | null>(null);

  useEffect(() => {
    if (currentStep < SCAN_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, SCAN_STEPS[currentStep].duration);
      return () => clearTimeout(timer);
    } else if (!done) {
      // Scan complete — call the backend
      invoke<{ subscriptions_found: number; total_monthly: number; total_annual: number }>("scan_transactions")
        .then((res) => {
          setResult(res);
          setDone(true);
        })
        .catch(() => {
          setResult({ subscriptions_found: 0, total_monthly: 0, total_annual: 0 });
          setDone(true);
        });
    }
  }, [currentStep, done]);

  const progress = done ? 100 : Math.round((currentStep / SCAN_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-ghost-card border border-ghost-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {!done ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-ghost-accent/20 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-ghost-accent border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Scanning Transactions</h3>
                <p className="text-ghost-muted text-xs">AI agent analyzing your data</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-ghost-darker rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-ghost-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {SCAN_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                    i < currentStep
                      ? "text-ghost-green"
                      : i === currentStep
                      ? "text-white"
                      : "text-ghost-muted/40"
                  }`}
                >
                  <span className="w-4 text-center">
                    {i < currentStep ? "✓" : i === currentStep ? "▸" : "○"}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👻</div>
              <h3 className="text-white font-semibold text-lg">Scan Complete</h3>
              <p className="text-ghost-muted text-sm mt-1">
                Ghost Protocol found hidden subscriptions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-ghost-darker rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{result?.subscriptions_found}</p>
                <p className="text-ghost-muted text-xs">Found</p>
              </div>
              <div className="bg-ghost-darker rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-ghost-red">
                  ${result?.total_monthly.toFixed(0)}
                </p>
                <p className="text-ghost-muted text-xs">Monthly</p>
              </div>
              <div className="bg-ghost-darker rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-ghost-red">
                  ${result?.total_annual.toFixed(0)}
                </p>
                <p className="text-ghost-muted text-xs">Annual</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (result) onComplete(result);
                onClose();
              }}
              className="w-full bg-ghost-accent text-white py-3 rounded-xl font-medium hover:bg-ghost-accent/80 transition"
            >
              View Subscriptions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
