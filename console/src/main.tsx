import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";

if (typeof window !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.error = function (...args: any[]) {
    const msg = args[0]?.toString() || "";
    if (msg.includes(":first-child") || msg.includes("pseudo class")) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = function (...args: any[]) {
    const msg = args[0]?.toString() || "";
    if (
      msg.includes(":first-child") ||
      msg.includes("pseudo class") ||
      msg.includes("potentially unsafe") ||
      msg.includes("[antd: Tooltip] `overlayClassName` is deprecated") ||
      msg.includes("flushSync was called from inside a lifecycle method")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.log = function (...args: any[]) {
    const msg = args[0]?.toString() || "";
    if (msg.includes("locize.com") || msg.includes("Locize")) {
      return;
    }
    originalLog.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
