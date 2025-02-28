"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password && name) {
      const userData = { username: name, points: 60 };
      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/login");
    } else {
      setError("All fields are required");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl font-bold">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSignup}>
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Sign Up
        </button>
      </form>
      <p className="mt-4">
        Already have an account? <a href="/login" className="text-blue-600">Log in here</a>
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
