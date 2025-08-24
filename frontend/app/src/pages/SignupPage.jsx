import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      const res = await API.post("/auth/signup", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-6 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-10 max-w-md w-full space-y-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 select-none">
          Create Account
        </h2>

        {error && (
          <p className="text-center text-red-600 text-sm font-medium select-none">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 transition text-gray-900 font-medium"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white py-3 rounded-lg font-semibold shadow-lg transition"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-700 select-none">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
