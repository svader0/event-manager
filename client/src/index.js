import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./Pages/Home";
import Layout from "./Pages/Layout";
import Example from "./Pages/Example";
import NoPage from "./Pages/NoPage";
import Event from "./Pages/Event";
import Location from "./Pages/Locations";
import Account from "./Pages/Account";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="example" element={<Example />} />
          <Route path="event/:id" element={<Event />} />
          <Route path="account" element={<Account />} />
          <Route path="location" element={<Location />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
