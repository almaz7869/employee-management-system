import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./App.css";

function App({
  employees = [],
  fetchEmployees = async () => {},
  loading = false,
  backendOk = true,
}) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");
  const [photo, setPhoto] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const [displaySalary, setDisplaySalary] = useState(0);
  const [clock, setClock] = useState("");

  const COLORS = ["#3366ff", "#00C49F", "#FFBB28", "#FF4444", "#8884d8"];

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSalary = useMemo(
    () => employees.reduce((sum, emp) => sum + Number(emp.salary || 0), 0),
    [employees],
  );

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (emp) =>
        String(emp.name || "")
          .toLowerCase()
          .includes(q) ||
        String(emp.department || "")
          .toLowerCase()
          .includes(q) ||
        String(emp.email || "")
          .toLowerCase()
          .includes(q),
    );
  }, [employees, search]);

  useEffect(() => {
    let count = 0;
    let salaryCount = 0;

    const interval = setInterval(() => {
      if (count < employees.length) count++;
      if (salaryCount < totalSalary)
        salaryCount += Math.max(1, Math.ceil(totalSalary / 30));

      setDisplayCount(count);
      setDisplaySalary(salaryCount > totalSalary ? totalSalary : salaryCount);

      if (count >= employees.length && salaryCount >= totalSalary) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [employees.length, totalSalary]);

  const deptData = useMemo(() => {
    const deptMap = {};
    employees.forEach((emp) => {
      const dept = String(emp.department || "Unknown");
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    return Object.keys(deptMap).map((key) => ({
      name: key,
      value: deptMap[key],
    }));
  }, [employees]);

  const getAvatar = (emp) => {
    const safeName = encodeURIComponent(String(emp.name || "Employee"));
    if (emp.photo && String(emp.photo).trim()) return emp.photo;
    return `https://ui-avatars.com/api/?name=${safeName}&background=2563eb&color=fff&size=128`;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setDepartment("");
    setSalary("");
    setPhoto("");
    setEditId(null);
  };

  const saveEmployee = async () => {
    if (!name.trim() || !email.trim() || !department.trim() || salary === "") {
      alert("Please fill Name, Email, Department and Salary.");
      return;
    }

    const employee = {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      salary: Number(salary),
      photo: photo.trim(),
    };

    try {
      if (editId === null) {
        const response = await fetch("http://localhost:8080/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employee),
        });
        if (!response.ok) throw new Error("Create failed");
      } else {
        const response = await fetch(
          `http://localhost:8080/employees/${editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee),
          },
        );
        if (!response.ok) throw new Error("Update failed");
      }

      resetForm();
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Could not save employee. Check backend server.");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/employees/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Could not delete employee. Check backend server.");
    }
  };

  const editEmployee = (emp) => {
    setName(emp.name || "");
    setEmail(emp.email || "");
    setDepartment(emp.department || "");
    setSalary(emp.salary ?? "");
    setPhoto(emp.photo || "");
    setEditId(emp.id);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 120);
    doc.text("EMS Employee Management Report", 40, 20);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Total Employees: ${employees.length}`, 14, 43);
    doc.text(`Total Salary Expense: ₹ ${totalSalary}`, 14, 51);

    const tableRows = employees.map((emp) => [
      emp.id,
      emp.name,
      emp.email,
      emp.department,
      emp.salary,
    ]);

    autoTable(doc, {
      head: [["ID", "Name", "Email", "Department", "Salary"]],
      body: tableRows,
      startY: 60,
      theme: "grid",
      headStyles: { fillColor: [51, 102, 255] },
    });

    const endY = doc.lastAutoTable?.finalY || 100;
    doc.text("Authorized By: EMS Admin Panel", 14, endY + 20);
    doc.text("Signature: ____________________", 14, endY + 30);

    doc.save("EMS_Full_Report.pdf");
  };

  if (loading && employees.length === 0) {
    return <div className="loading-screen">Loading employee data...</div>;
  }

  return (
    <div className={darkMode ? "main-wrapper dark" : "main-wrapper"}>
      <aside className="sidebar">
        <h2>EMS Panel</h2>
        <div className="clock">{clock}</div>

        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li onClick={() => navigate("/reports")}>Reports</li>
          <li
            onClick={() => {
              localStorage.removeItem("emsLogin");
              navigate("/");
            }}
          >
            Logout
          </li>
        </ul>

        <button className="toggle-btn" onClick={() => setDarkMode((v) => !v)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </aside>

      <main className="container">
        <div className="topbar">
          <h1>Employee Management System</h1>
          <div className="topbar-note">
            {backendOk ? "Backend connected" : "Backend unavailable"}
          </div>
        </div>

        <div className="cards">
          <div className="card">Employees: {displayCount}</div>
          <div className="card">Salary: ₹ {displaySalary}</div>
        </div>

        <input
          type="text"
          placeholder="Search by name, email or department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />

        <button className="pdf-btn" onClick={downloadPDF}>
          Download PDF Report
        </button>

        <section className="charts">
          <div className="chart-box">
            <h3>Salary Chart</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={employees}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="salary" fill="#3366ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h3>Department Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={deptData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                  label
                >
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="form-box">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
          <input
            type="text"
            placeholder="Paste Employee Photo URL"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          <button onClick={saveEmployee}>
            {editId === null ? "Add Employee" : "Update Employee"}
          </button>
          {editId !== null && (
            <button className="secondary-btn" onClick={resetForm} type="button">
              Cancel Edit
            </button>
          )}
        </section>

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>
                      <img
                        src={getAvatar(emp)}
                        alt={emp.name || "employee"}
                        className="avatar"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=EMP&background=2563eb&color=fff&size=128`;
                        }}
                      />
                    </td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.salary}</td>
                    <td>
                      <div className="action-group">
                        <button
                          className="edit-btn"
                          onClick={() => editEmployee(emp)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteEmployee(emp.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <footer className="footer">Developed by Almaz Sheikh © 2026</footer>
      </main>
    </div>
  );
}

export default App;
