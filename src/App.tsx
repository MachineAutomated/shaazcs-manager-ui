import React from "react";
import type { ReactElement } from "react";
import './App.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

const ProtectedRoute: React.FC<{ element: ReactElement }> = ({ element }) => {
  const token = sessionStorage.getItem("jwt");
  return token ? element : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
