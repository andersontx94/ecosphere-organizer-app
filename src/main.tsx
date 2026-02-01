import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 🔥 FORÇA REDIRECIONAMENTO GLOBAL
if (window.location.pathname === "/login") {
  window.location.replace("/dashboard");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
