import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FIFOPayCalculatorMVP from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FIFOPayCalculatorMVP />
  </React.StrictMode>
);
