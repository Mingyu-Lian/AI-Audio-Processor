"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "test@example.com" && password === "password123") {
      const userData = { username: "TestUser", points: 60 };
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleLogin}>
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
      </form>
      <p className="mt-4">
        No account? <a href="/signup" className="text-blue-600">Sign up here</a>
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Return to Home
      </button>
    </div>
  );
}
