"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SignUpModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (email && password && name) {
      const userData = { username: name, points: 60 };
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.reload();
    } else {
      setError("All fields are required");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sign up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>Create an account to start using our service.</DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-500">{error}</p>}
        <input className="border p-2 rounded w-full" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2 rounded w-full mt-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border p-2 rounded w-full mt-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button onClick={handleSignup} className="mt-4 w-full">Sign Up</Button>
      </DialogContent>
    </Dialog>
  );
}