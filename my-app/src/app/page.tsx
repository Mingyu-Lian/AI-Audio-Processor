"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginSignupModal from "@/components/LoginSignupModal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, setUser] = useState<{ username: string; points: number } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 p-6 text-center">
        {!user ? (
          // 未登录状态，显示“Login/Signup”按钮
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Audio Transcription</h2>
            <p className="text-gray-600">Please log in or sign up to use the tool.</p>
            <div className="mt-6">
              <LoginSignupModal />
            </div>
          </div>
        ) : (
          // 登录后，显示 Upload UI
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold">Upload Audio File</h2>
            <Button className="mt-4">Choose File</Button>
            <Button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Submit</Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
