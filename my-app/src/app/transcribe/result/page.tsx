"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
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



export default function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    audioRef.current?.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const index = mockTranscriptionData.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    );
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [currentTime]);
  
  
  const handleSegmentClick = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start;
      audioRef.current.play();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-col items-center flex-1 p-6 w-full max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Transcription Result</h2>

        {/* 音频播放器 */}
        {/* <audio ref={audioRef} controls className="w-full mb-6">
        
          <source src="/audio/sample.mp3" type="audio/mpeg" />
          Your browser does not support audio playback.
        </audio>
         */}
         
         <AudioPlayer
            ref={audioRef}
            audioUrl="/audio/sample.mp3"
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
          />


        {/* 转录段落列表 */}
        <div className="w-full border rounded-md overflow-hidden">
          <div className="bg-gray-200 px-4 py-2 font-semibold grid grid-cols-12 text-sm">
            <div className="col-span-3">Time</div>
            <div className="col-span-9">Transcript</div>
          </div>
          {/* iterate over the transcription data */}
          {mockTranscriptionData.map((segment, index) => (
            <div
              key={index}
              onClick={() => handleSegmentClick(segment.start)}
              className={`grid grid-cols-12 border-t px-4 py-3 transition text-left cursor-pointer ${
                index === activeIndex ? "bg-yellow-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="col-span-3 font-mono text-gray-600 text-sm">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </div>
              <div className="col-span-9 text-gray-800 text-sm relative">
                {segment.text}
                {segment.tag && (
                  <span className="absolute top-0 right-0 bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-300">
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
