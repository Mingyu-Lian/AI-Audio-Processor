"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

type Props = {
  audioUrl: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
};

const AudioPlayer = forwardRef<HTMLAudioElement, Props>(
  ({ audioUrl, currentTime, onTimeUpdate }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 暴露内部 audioRef 给外部页面
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => {
        onTimeUpdate(audio.currentTime);
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }, [onTimeUpdate]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (Math.abs(audio.currentTime - currentTime) > 0.5) {
        audio.currentTime = currentTime;
      }
    }, [currentTime]);

    return (
      <audio
        ref={audioRef}
        controls
        className="w-full mb-6"
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
    );
  }
);

export default AudioPlayer;
