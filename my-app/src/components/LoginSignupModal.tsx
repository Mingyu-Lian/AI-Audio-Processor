"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginSignupModal() {
  const [isLogin, setIsLogin] = useState(true); // true = 登录, false = 注册
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // 仅注册时使用
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (isLogin) {
      // 登录逻辑
      if (email === "test@example.com" && password === "password123") {
        localStorage.setItem("user", JSON.stringify({ username: "TestUser", points: 60 }));
        window.location.reload(); // 刷新页面
      } else {
        setError("Invalid email or password");
      }
    } else {
      // 注册逻辑
      if (email && password && name) {
        localStorage.setItem("user", JSON.stringify({ username: name, points: 60 }));
        window.location.reload();
      } else {
        setError("All fields are required");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Signup</Button>
      </DialogTrigger>
      <DialogContent className="p-6 w-[400px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Log in" : "Sign up"}</DialogTitle> {/* ✅ 添加 DialogTitle */}
          <div className="flex justify-center gap-6 border-b pb-3">
            <button
              className={`text-lg font-bold ${isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
              onClick={() => setIsLogin(true)}
            >
              Log in
            </button>
            <button
              className={`text-lg font-bold ${!isLogin ? "border-b-2 border-blue-500" : "text-gray-500"}`}
              onClick={() => setIsLogin(false)}
            >
              Sign up
            </button>
          </div>
        </DialogHeader>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex flex-col gap-4 mt-4">
          {!isLogin && (
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
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
          <Button onClick={handleSubmit} className="w-full">
            {isLogin ? "Log in" : "Sign up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
