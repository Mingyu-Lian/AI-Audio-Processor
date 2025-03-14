"use client";

import { useEffect, useState } from "react";
import LoginSignupModal from "./LoginSignupModal";
import AddPointModal from "./AddPointModal";

// 1) 声明用户类型
type UserType = {
  email: string;
  points: number;
  token?: string; // 如果不需要也可以不写
};

export default function Header() {
  // 2) 给 useState 声明类型
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    // 3) 组件加载时，从 localStorage 获取用户信息
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      // 注意: JSON.parse 之后应该是 { email, points, token }
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 点击注销: 清除 localStorage，重置状态，并刷新页面
  const handleLogout = () => {
    localStorage.removeItem("user"); 
    setUser(null);                  
    window.location.reload();       
  };

  return (
    <header className="w-full p-4 bg-gray-100 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">Audio Transcription</h1>
      <nav>
        {user ? (
          // 如果 user 不为空（已登录），显示用户信息和登出按钮
          <div className="flex items-center space-x-4">
            <span>👤 {user.email}</span>
            <span>⭐ {user.points} Points</span>
            <AddPointModal />
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          // 否则显示登录弹窗按钮
          <LoginSignupModal />
        )}
      </nav>
    </header>
  );
}