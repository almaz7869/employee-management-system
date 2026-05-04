import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("emsLogin");
    if (isLoggedIn === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    if (username.trim() === "admin" && password === "admin123") {
      localStorage.setItem("emsLogin", "true");
      navigate("/dashboard", { replace: true });
    } else {
      setErrorMsg("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>EMS Admin Login</h1>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {errorMsg && <p className="error-text">{errorMsg}</p>}
      </div>
    </div>
  );
}

export default Login;
