"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockTranscriptionData } from "../mockTranscriptionData";

const mockKeywords = [
  "artificial intelligence",
  "machine learning",
  "ethical considerations",
  "privacy implications",
  "job displacement",
  "AI bias",
  "responsible AI",
  "healthcare integration",
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function TranscriptionResultPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col items-center justify-start flex-1 p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Transcription</h2>

        {/* Keyword Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {mockKeywords.map((keyword, idx) => (
            <span
              key={idx}
              className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Table-style Transcript Display */}
        <div className="w-full border rounded-md overflow-hidden">
          <div className="bg-gray-200 px-4 py-2 font-semibold grid grid-cols-12 text-sm">
            <div className="col-span-3">Time</div>
            <div className="col-span-9">Transcript</div>
          </div>

          {mockTranscriptionData.map((segment, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 border-t px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="col-span-3 text-gray-600 font-mono text-sm">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </div>
              <div className="col-span-9 relative text-gray-800 text-sm">
                {segment.text}
                {segment.tag && (
                  <span className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-300">
                    {segment.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
