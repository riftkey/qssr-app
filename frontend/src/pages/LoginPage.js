import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError("Email dan password wajib diisi!");
    return;
  }

  try {
    const response = await fetch("https://qssr-app-production.up.railway.app/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login gagal");
      return;
    }

    // simpan token ke localStorage
    localStorage.setItem("token", data.token);

    console.log("Login berhasil:", data);
    setError("");
    navigate("/dashboard"); // redirect ke dashboard
  } catch (err) {
    console.error(err);
    setError("Terjadi kesalahan server");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-login bg-cover bg-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
  Belum punya akun? <a href="/register" className="text-blue-600 font-medium hover:underline">Daftar sekarang</a>
</p>

      </div>
    </div>
  );
};

export default LoginPage;
