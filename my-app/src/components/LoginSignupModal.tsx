"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginSignupModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  const [error, setError] = useState<{ email?: string; password?: string; general?: string }>({});
  const [forgotPassword, setForgotPassword] = useState(false); // 忘记密码模式
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError({});
    setSuccessMessage("");

    if (!validateEmail(email)) {
      setError((prev) => ({ ...prev, email: "Invalid email" }));
      return;
    }

    if (forgotPassword) {
      // 这里是请求后端发送重置密码邮件的地方
      console.log(`Requesting password reset for ${email}`);

      // 这里应该调用后端 API，暂时模拟
      setSuccessMessage("A password reset email has been sent.");
      return;
    }

    if (isLogin) {
      const mockUsers = [
        { email: "test@example.com", password: "password123", username: "TestUser", points: 60 },
      ];
      const user = mockUsers.find((u) => u.email === email);

      if (!user) {
        setError((prev) => ({ ...prev, email: "Account does not exist" }));
        return;
      }

      if (user.password !== password) {
        setError((prev) => ({ ...prev, password: "Incorrect password" }));
        return;
      }

      localStorage.setItem("user", JSON.stringify({ username: user.username, points: user.points }));
      window.location.reload();
    } else {
      if (!name) {
        setError((prev) => ({ ...prev, general: "Name is required" }));
        return;
      }

      localStorage.setItem("user", JSON.stringify({ username: name, points: 60 }));
      window.location.reload();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Signup</Button>
      </DialogTrigger>
      <DialogContent className="p-6 w-[400px]">
        <DialogHeader>
          <DialogTitle>{forgotPassword ? "Reset Password" : isLogin ? "Log in" : "Sign up"}</DialogTitle>
          {!forgotPassword && (
            <div className="flex justify-center gap-6 border-b pb-3">
              <button
                className={`text-lg font-bold ${isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
                onClick={() => { setIsLogin(true); setError({}); }}
              >
                Log in
              </button>
              <button
                className={`text-lg font-bold ${!isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
                onClick={() => { setIsLogin(false); setError({}); }}
              >
                Sign up
              </button>
            </div>
          )}
        </DialogHeader>

        {error.general && <p className="text-red-500 text-center">{error.general}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        <div className="flex flex-col gap-4 mt-4">
          {!isLogin && !forgotPassword && (
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <div className="flex flex-col">
            <input
              className={`border p-2 rounded ${error.email ? "border-red-500" : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
          </div>
          {!forgotPassword && (
            <div className="flex flex-col">
              <input
                className={`border p-2 rounded ${error.password ? "border-red-500" : ""}`}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full">
            {forgotPassword ? "Reset Password" : isLogin ? "Log in" : "Sign up"}
          </Button>
        </div>

        {!forgotPassword && isLogin && (
          <button className="text-blue-500 text-sm mt-2" onClick={() => setForgotPassword(true)}>
            Forgot password?
          </button>
        )}
        {forgotPassword && (
          <button className="text-blue-500 text-sm mt-2" onClick={() => setForgotPassword(false)}>
            Back to login
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
