import React, { useState } from "react";
import api from "../services/api";

interface LoginProps {
  onLogin: (user: any) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email.trim());
      formData.append("password", password);

      console.log("Sending login request:", email);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data.access_token;
      const user = response.data.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server");
      }

      // Save authentication data
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("LOGIN SUCCESS:", user);

      // Tell App.tsx that login succeeded
      onLogin(user);

    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "40px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            margin: "0 auto 20px",
            borderRadius: "12px",
            background: "#1f4e79",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          NS
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#1f2937",
            marginBottom: "8px",
          }}
        >
          NetSuite Academy
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Interactive ERP Training & Simulation
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@test.com"
            required
            style={{
              width: "100%",
              padding: "12px",
              boxSizing: "border-box",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          />

          <label
            style={{
              display: "block",
              marginTop: "18px",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
            style={{
              width: "100%",
              padding: "12px",
              boxSizing: "border-box",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "25px",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#1f4e79",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          Learn • Practice • Master
        </p>
      </div>
    </div>
  );
}

export default Login;