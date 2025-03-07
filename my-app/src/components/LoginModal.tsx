"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (email === "test@example.com" && password === "password123") {
      const userData = { username: "TestUser", points: 60 };
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.reload(); // 刷新页面更新 Header
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Log in</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>Enter your credentials to access your account.</DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500">{error}</p>}
        <input className="border p-2 rounded w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border p-2 rounded w-full mt-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button onClick={handleLogin} className="mt-4 w-full">Login</Button>
      </DialogContent>
    </Dialog>
  );
}