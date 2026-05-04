import React from "react";
import EmployeeApp from "./App";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <h2>EMS Panel</h2>
        <ul>
          <li>Dashboard</li>
          <li>Employees</li>
          <li>Reports</li>
          <li onClick={logout}>Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <EmployeeApp />
      </div>
    </div>
  );
}

export default Dashboard;
