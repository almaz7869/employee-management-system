import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./App.css";

function Reports({
  employees = [],
  fetchEmployees = async () => {},
  backendOk = true,
}) {
  const navigate = useNavigate();

  const totalEmployees = employees.length;
  const totalSalary = useMemo(
    () => employees.reduce((sum, emp) => sum + Number(emp.salary || 0), 0),
    [employees],
  );
  const averageSalary =
    totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

  const highestEmployee = useMemo(() => {
    if (employees.length === 0) return null;
    return employees.reduce((max, emp) =>
      Number(emp.salary || 0) > Number(max.salary || 0) ? emp : max,
    );
  }, [employees]);

  const lowestEmployee = useMemo(() => {
    if (employees.length === 0) return null;
    return employees.reduce((min, emp) =>
      Number(emp.salary || 0) < Number(min.salary || 0) ? emp : min,
    );
  }, [employees]);

  const departmentStats = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const dept = String(emp.department || "Unknown");
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).map(([department, count]) => ({
      department,
      count,
    }));
  }, [employees]);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 120);
    doc.text("EMS Reports Dashboard", 50, 18);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total Employees: ${totalEmployees}`, 14, 40);
    doc.text(`Average Salary: ₹ ${averageSalary}`, 14, 48);
    doc.text(
      `Highest Salary: ${highestEmployee ? `${highestEmployee.name} (₹ ${highestEmployee.salary})` : "-"}`,
      14,
      56,
    );
    doc.text(
      `Lowest Salary: ${lowestEmployee ? `${lowestEmployee.name} (₹ ${lowestEmployee.salary})` : "-"}`,
      14,
      64,
    );

    autoTable(doc, {
      startY: 74,
      head: [["ID", "Name", "Email", "Department", "Salary"]],
      body: employees.map((emp) => [
        emp.id,
        emp.name,
        emp.email,
        emp.department,
        emp.salary,
      ]),
      theme: "grid",
      headStyles: { fillColor: [51, 102, 255] },
    });

    const endY = doc.lastAutoTable?.finalY || 110;
    doc.text("Authorized By: EMS Admin Panel", 14, endY + 20);
    doc.text("Signature: ____________________", 14, endY + 30);

    doc.save("EMS_Reports.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      employees.map((emp) => ({
        ID: emp.id,
        Name: emp.name,
        Email: emp.email,
        Department: emp.department,
        Salary: emp.salary,
        Photo: emp.photo || "",
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "EMS_Employee_Report.xlsx");
  };

  return (
    <div className="reports-page">
      <div className="reports-topbar">
        <h1>EMS Reports Dashboard</h1>
        <div className={backendOk ? "status-ok" : "status-bad"}>
          {backendOk ? "Backend connected" : "Backend unavailable"}
        </div>
      </div>

      <div className="report-cards">
        <div className="report-box">Total Employees: {totalEmployees}</div>
        <div className="report-box">Average Salary: ₹ {averageSalary}</div>
        <div className="report-box">
          Highest Salary:{" "}
          {highestEmployee
            ? `${highestEmployee.name} (₹ ${highestEmployee.salary})`
            : "-"}
        </div>
        <div className="report-box">
          Lowest Salary:{" "}
          {lowestEmployee
            ? `${lowestEmployee.name} (₹ ${lowestEmployee.salary})`
            : "-"}
        </div>
      </div>

      <div className="report-actions">
        <button className="pdf-btn" onClick={downloadPDF}>
          Download PDF Report
        </button>
        <button className="secondary-btn" onClick={downloadExcel}>
          Download Excel Report
        </button>
        <button className="secondary-btn" onClick={fetchEmployees}>
          Refresh Data
        </button>
        <button
          className="secondary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back To Dashboard
        </button>
      </div>

      <section className="report-section">
        <h3>Department Wise Count</h3>
        <div className="dept-list">
          {departmentStats.length === 0 ? (
            <div className="empty-row">No department data.</div>
          ) : (
            departmentStats.map((item) => (
              <div key={item.department} className="dept-item">
                {item.department}: {item.count}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="report-section">
        <h3>Detailed Employee Table</h3>
        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No employees available.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.salary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Reports;
