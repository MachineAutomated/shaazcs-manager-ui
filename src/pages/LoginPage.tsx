import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/login.css";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [registering] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        username,
        password,
      });

      const token = response.data.token;
      if (!token) {
        throw new Error("No token received");
      }
      sessionStorage.setItem("jwt", token);
      navigate("/dashboard");

    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ height:'400px', width:'500px', alignContent: 'center'}}>
      <Card title="Login" className="login-card">
        <div className="login-row">
          <label htmlFor="username" className="input-label">
            Username
          </label>
          <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{ width: '63%'}}
          />
        </div>
        <div className="login-row">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              placeholder="Enter password"
              style={{ width: '30%'}}
          />
        </div>
        <div className="error-row">
          {error && <div className="p-error input-col">{error}</div>}
        </div>
        <div className="action-row">
          <div className="action-col">
            <Button
              label={loading ? "Logging in..." : "Login"}
              icon="pi pi-sign-in"
              onClick={handleLogin}
              loading={loading}
              className="p-button-rounded p-button-outlined login-btn"
              style={{ marginTop: '10px', marginRight: '5px' }}
            />
          </div>
          
          <div className="action-col">
            <Button
              label={registering ? "Registering..." : "Register"}
              icon="pi pi-register"
              // onClick={handleRegister} // Registration handler can be implemented similarly
              // loading={loading}
              className="p-button-rounded p-button-outlined register-btn"
              style={{ marginTop: '10px' }}
            />
          </div>
        </div>

        
      </Card>
    </div>
  );
};

export default LoginPage;
