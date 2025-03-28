"use client";

import { useEffect, useRef } from "react";

type Props = {
  audioUrl: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
};

export default function AudioPlayer({ audioUrl, currentTime, onTimeUpdate }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        onTimeUpdate(audioRef.current.currentTime);
      }
    };
    audioRef.current?.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <audio controls ref={audioRef} className="w-full">
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support audio playback.
    </audio>
  );
}
