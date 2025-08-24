import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-6 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 max-w-md w-full space-y-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 select-none">
          Welcome Back
        </h2>

        {error && (
          <p className="text-center text-red-600 text-sm font-medium select-none">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 transition text-gray-900 font-medium"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 transition text-gray-900 font-medium"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white py-3 rounded-lg font-semibold shadow-lg transition"
        >
          Login
        </button>

        <p className="text-center text-gray-700 select-none">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
