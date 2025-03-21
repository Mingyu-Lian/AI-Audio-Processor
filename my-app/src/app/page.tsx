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
        {!user ? (
          // 未登录状态，显示“Login/Signup”按钮
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome to SentriScribe</h2>
            <p className="text-gray-600">Please log in or sign up to use the tool.</p>
            <div className="mt-6">
              <LoginSignupModal />
            </div>
          </div>
        ) : (
          // 登录后，显示 Upload UI
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold">Upload Audio File</h2>
            
            {/* 拖拽上传框 */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="mt-4 w-96 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg cursor-pointer"
            >
              <p>Drag & Drop files here</p>
            </div>

            {/* 隐藏的文件选择框 */}
            <input
              type="file"
              multiple
              accept="audio/*"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* 选择文件按钮 */}
            <Button className="mt-4" onClick={() => document.getElementById("fileInput")?.click()}>
              Choose File
            </Button>

            {/* 提交按钮 */}
            <Button className="mt-4 bg-green-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
              {uploading ? "Uploading..." : "Submit"}
            </Button>

            {/* 选中文件列表 */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold">Selected Files:</h3>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
