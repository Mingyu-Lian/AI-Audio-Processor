"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, setUser] = useState<{ username: string; points: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleStart = () => {
    if (!user) {
      alert("Please login or sign up first!");
      router.push("/login");
    } else {
      router.push("/upload");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 p-6 text-center">
        <h2 className="text-3xl font-bold">Welcome to Audio Transcription</h2>
        <p className="mt-4 text-gray-600">Upload your audio files and get instant transcriptions.</p>
        <Button className="mt-6" variant="default" onClick={handleStart}>
          Get Started
        </Button>
      </main>
      <Footer />
    </div>
  );
}
