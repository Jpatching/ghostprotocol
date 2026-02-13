import Header from "./components/Layout/Header";
import Dashboard from "./components/Dashboard";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-ghost-dark text-ghost-text">
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;
