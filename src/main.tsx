
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
import { applyMedicationOversightDemoSeed } from "./app/data/medicationOversightDemoSeed";

// Mock medication oversight samples: added only when missing, never replaced.
try {
  applyMedicationOversightDemoSeed();
} catch {
  /* sample data must never block the app */
}

  createRoot(document.getElementById("root")!).render(<App />);
  