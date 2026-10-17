import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WarningApp } from "./WarningApp";
import "./warning.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WarningApp />
  </StrictMode>
);
