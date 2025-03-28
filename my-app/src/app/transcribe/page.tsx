"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function TranscribePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");

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

    // 模拟上传 + 转录
    setTimeout(() => {
      setResult("Hello, this is a sample transcription result with timestamps.");
      setUploading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 p-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Transcribe Your Audio</h2>

        {/* 拖拽上传框 */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-96 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg cursor-pointer mb-4"
        >
          <p>Drag & Drop files here</p>
        </div>

        {/* 隐藏的文件选择框 */}
        <input
          type="file"
          accept="audio/*"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 选择文件按钮 */}
        <Button onClick={() => document.getElementById("fileInput")?.click()}>
          Choose File
        </Button>

        {/* 提交按钮 */}
        <Button
          className="mt-4 bg-green-500 text-white"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? "Transcribing..." : "Start Transcription"}
        </Button>

        {/* 选中文件列表 */}
        {files.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="font-bold">Selected Files:</h3>
            <ul className="text-sm text-gray-700 mt-2">
              {files.map((file, index) => (
                <li key={index}>🎧 {file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 模拟转写结果 */}
        {result && (
          <div className="mt-6 w-full max-w-xl text-left">
            <h3 className="font-bold mb-2">Transcription Result:</h3>
            <div className="bg-gray-100 p-4 rounded shadow text-sm">
              {result}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
