import { useState } from "react";
import Header from "./components/Layout/Header";
import Dashboard from "./components/Dashboard";
import Activity from "./components/Activity";
import Settings from "./components/Settings";
import "./index.css";

type Page = "dashboard" | "activity" | "settings";

function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="min-h-screen bg-ghost-dark text-ghost-text">
      <Header />
      {/* Navigation */}
      <nav className="border-b border-ghost-border bg-ghost-darker px-6">
        <div className="flex gap-1">
          {([
            { id: "dashboard" as Page, label: "Dashboard" },
            { id: "activity" as Page, label: "Activity" },
            { id: "settings" as Page, label: "Settings" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`px-4 py-2.5 text-sm transition border-b-2 ${
                page === tab.id
                  ? "border-ghost-accent text-white"
                  : "border-transparent text-ghost-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      {/* Page Content */}
      {page === "dashboard" && <Dashboard />}
      {page === "activity" && <Activity />}
      {page === "settings" && <Settings />}
    </div>
  );
}

export default App;
