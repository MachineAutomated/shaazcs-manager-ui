import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/login.css";
import { Dialog } from 'primereact/dialog';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);
  const [registerDialogVisibility, setRegisterDialogVisibility] = useState<boolean>(false);
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
      sessionStorage.setItem("username", username);

      // ADD BELOW: start 1h timer and notify app
      // const expiresAt = new Date(Date.now() + 3600000).toISOString(); //Todo: 3600000 will be customized later with environment variable
      const expiresAt = new Date(Date.now() + 360000).toISOString(); //Todo: 3600000 will be customized later with environment variable
      sessionStorage.setItem("jwtExpiresAt", expiresAt);
      window.dispatchEvent(new CustomEvent("jwt-start", { detail: { expiresAt } }));

      navigate("/dashboard");

    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setRegistering(true);

    try {

      const response = await api.post("/register", {
        "username": registerUsername,
        "password": registerPassword,
      });

      if (response.status !== 200) {
        throw new Error("Registration failed");
      }

      const data = response.data;
      const clientName = data["TenantInfo"]["clientName"];

      alert(`Registration successful! ${clientName} can now log in after closing this alert.`);

    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration error");
    } finally {
      setLoading(false);
      setRegisterDialogVisibility(false);
      setRegistering(false);
    }
  };

  return (
    <div className="login-page" style={{ height: '400px', width: '500px', alignContent: 'center' }}>
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
            style={{ width: '63%' }}
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
            style={{ width: '30%' }}
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
              label={registerDialogVisibility ? "Registering..." : "Register"}
              icon="pi pi-register"
              onClick={() => { setRegisterDialogVisibility(true)}}
              className="p-button-rounded p-button-outlined register-btn"
              style={{ marginTop: '10px' }}
            />
            <Dialog header="Register with new user and password" visible={registerDialogVisibility} style={{ width: '50vw' }} onHide={() => { if (!registerDialogVisibility) return; setRegisterDialogVisibility(false); }}>
              <div >
                <InputText
                  id="register_username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Enter username"
                  
                />
                <Password
                  id="register_password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  feedback={false}
                  toggleMask
                  placeholder="Enter password"
                  style={{ marginLeft: '10px' }}
                />
                <Button
                  label={registering ? "Registering..." : "Register"}
                  icon="pi pi-register"
                  onClick={handleRegister}
                  className="p-button-rounded p-button-outlined register-btn"
                  style={{ marginLeft: '10px' }}
                />
              </div>
            </Dialog>

          </div>
        </div>


      </Card>
    </div>
  );
};

export default LoginPage;
