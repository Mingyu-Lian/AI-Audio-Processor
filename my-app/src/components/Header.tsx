"use client";

import { useEffect, useState } from "react";
import LoginSignupModal from "./LoginSignupModal";
import AddPointModal from "./AddPointModal";

export default function Header() {
  const [user, setUser] = useState<{ username: string; points: number } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
          <div className="flex items-center space-x-4">
            <span>👤 {user.username}</span>
            <span>⭐ {user.points} Points</span>
            <AddPointModal /> {/* ✅ 新增 Add Point 按钮 */}
            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <LoginSignupModal />
        )}
      </nav>
    </header>
  );
}
