"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginSignupModal from "@/components/LoginSignupModal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, setUser] = useState<{ username: string; credits: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      router.push("/transcribe"); // 👉 自动跳转到 /transcribe 页面
    }
  }, []);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setFiles([...files, ...Array.from(event.dataTransfer.files)]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setTimeout(() => {
      alert("Upload complete!");
      setUploading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      {!user && (
        <div>
          <h2 className="text-3xl font-bold mb-4">Welcome to SentriScribe</h2>
          <p className="text-gray-600">Please log in or sign up to use the tool.</p>
          <div className="mt-6">
            <LoginSignupModal />
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
