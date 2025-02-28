"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Upload() {
  const [user, setUser] = useState<{ username: string; points: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      localStorage.setItem("redirectAfterLogin", "/upload");
      router.push("/login");
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
        <h2 className="text-3xl font-bold">Upload Audio File</h2>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mt-4 w-96 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg cursor-pointer"
        >
          <p>Drag & Drop files here</p>
        </div>
        <input type="file" multiple accept="audio/*" className="mt-4" onChange={handleFileChange} />
        <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          {uploading ? "Uploading..." : "Submit"}
        </button>
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
      </main>
      <Footer />
    </div>
  );
}
