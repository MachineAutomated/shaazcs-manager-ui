import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
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
    <div className="flex justify-content-center align-items-center h-screen bg-gray-100">
      <Card title="Login" className="w-25rem shadow-3">
        <div className="flex flex-column gap-3">
          <span className="p-float-label">
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
            <label htmlFor="username">Username</label>
          </span>

          <span className="p-float-label">
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
            />
            <label htmlFor="password">Password</label>
          </span>

          {error && <small className="p-error">{error}</small>}

          <Button
            label={loading ? "Logging in..." : "Login"}
            icon="pi pi-sign-in"
            onClick={handleLogin}
            loading={loading}
            className="w-full"
          />
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
