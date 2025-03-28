"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import { useEffect, useState } from "react";
import { mockAudioData } from "../mockAudioData";
import { mockTranscriptionData } from "../mockTranscriptionData";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function TranscriptionResultPage() {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const index = mockTranscriptionData.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [currentTime]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col items-center justify-start flex-1 p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">{mockAudioData.title}</h2>

        <AudioPlayer
          audioUrl={mockAudioData.url}
          currentTime={currentTime}
          onTimeUpdate={(t) => setCurrentTime(t)}
        />

        <div className="w-full border rounded-md overflow-hidden mt-6">
          <div className="bg-gray-200 px-4 py-2 font-semibold grid grid-cols-12 text-sm">
            <div className="col-span-3">Time</div>
            <div className="col-span-9">Transcript</div>
          </div>

          {mockTranscriptionData.map((seg, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-12 px-4 py-3 text-sm border-t transition cursor-pointer ${
                idx === activeIndex ? "bg-yellow-100" : "hover:bg-gray-50"
              }`}
              onClick={() => setCurrentTime(seg.start)}
            >
              <div className="col-span-3 font-mono text-gray-500">
                {formatTime(seg.start)} - {formatTime(seg.end)}
              </div>
              <div className="col-span-9 relative text-gray-800">
                {seg.text}
                {seg.tag && (
                  <span className="absolute top-0 right-0 bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-300">
                    {seg.tag}
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
