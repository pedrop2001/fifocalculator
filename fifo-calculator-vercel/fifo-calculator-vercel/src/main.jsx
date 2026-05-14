import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FIFOPayCalculatorMVP from "./App.jsx";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FIFOPayCalculatorMVP />
    <Analytics />
  </React.StrictMode>
);
