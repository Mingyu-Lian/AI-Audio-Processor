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

  const file = files[0];
  const filename = `${Date.now()}-${file.name}`;
  setUploading(true);

  try {
    // Step 1: 获取 SAS 上传链接
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let token = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        token = parsed?.tokens?.access || parsed?.access || null;
      } catch (e) {
        console.error("Invalid JSON in localStorage['user']", e);
      }
    }

    if (!token) {
      alert("Please login first.");
      throw new Error("Missing token");
    }

    const sasRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-upload-url/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename }),
    });

    const sasData = await sasRes.json();
    if (!sasData.upload_url || !sasData.blob_url) throw new Error("Failed to get upload URL");

    // Step 2: 上传音频到 Azure Blob
    await fetch(sasData.upload_url, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type,
      },
      body: file,
    });

    // Step 3: 提交 Azure Batch 任务
    const batchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submit-batch-job/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ audio_url: sasData.blob_url }),
    });

    const batchData = await batchRes.json();
    const jobUrl = batchData.job_url;
    if (!jobUrl) throw new Error("Failed to submit batch job");

    // Step 4: 轮询获取转录结果
    let status = "Running";
    let segments = [];
    for (let i = 0; i < 20; i++) {
      await new Promise((res) => setTimeout(res, 5000)); // wait 5s
      const resultRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-transcription-result/?job_url=${encodeURIComponent(jobUrl)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resultData = await resultRes.json();
      if (resultData.status === "Succeeded") {
        segments = resultData.segments;
        break;
      } else if (resultData.status === "Failed") {
        throw new Error("Transcription failed");
      }
    }

    // Step 5: 存入 localStorage，并跳转 result 页面
    localStorage.setItem("transcription_result", JSON.stringify(segments));
    window.location.href = "/result";
  } catch (err: any) {
    alert("Error: " + err.message);
  } finally {
    setUploading(false);
  }
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
