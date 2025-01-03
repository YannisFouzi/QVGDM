import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import RemoteControl from "./components/RemoteControl";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/remote" element={<RemoteControl />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
