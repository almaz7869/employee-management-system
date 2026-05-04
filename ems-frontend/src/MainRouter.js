import React, { useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Reports from "./Reports";

function RequireAuth({ children }) {
  const isLoggedIn = localStorage.getItem("emsLogin") === "true";
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function MainRouter() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(true);

  const fetchEmployees = async () => {
    try {
      setBackendOk(true);
      const response = await fetch("http://localhost:8080/employees");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
      setBackendOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <App
              employees={employees}
              fetchEmployees={fetchEmployees}
              loading={loading}
              backendOk={backendOk}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth>
            <Reports
              employees={employees}
              fetchEmployees={fetchEmployees}
              backendOk={backendOk}
            />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default MainRouter;
