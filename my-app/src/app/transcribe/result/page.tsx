"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DynamicAudioPlayer from "@/components/AudioPlayer"
import { mockTranscriptionData } from "../mockTranscriptionData"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")
  return `${mins}:${secs}`
}

export default function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleScroll = () => {
      setIsUserScrolling(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsUserScrolling(false), 3000) // wait 3 seconds after last scroll
    }
  
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
    }

    audioRef.current?.addEventListener("timeupdate", handleTimeUpdate)
    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  useEffect(() => {
    const index = mockTranscriptionData.findIndex((seg) => currentTime >= seg.start && currentTime < seg.end)
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index)
  
      if (!isUserScrolling) {
        const el = segmentRefs.current[index]
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }, [currentTime, activeIndex, isUserScrolling])

  const handleSegmentClick = (start: number) => {
    if (audioRef.current) {
      // Update both the audio element and the state
      audioRef.current.currentTime = start
      setCurrentTime(start)
      audioRef.current.play()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 relative">
        {/* Title Section */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transcription Result</h1>
          <p className="text-gray-600 mt-2">Audio transcription with timestamps</p>
        </div>

        {/* Main Content Area - Adjusted for the fixed audio player */}
        <div className={`max-w-5xl mx-auto ${isMobile ? "pr-4 sm:pr-16" : "pr-0 md:pr-16"}`}>
          {/* Transcript Container - No fixed height or scrollbar */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Header Row */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-2">
              <div className="col-span-3 font-medium text-gray-700 text-sm">Timestamp</div>
              <div className="col-span-9 font-medium text-gray-700 text-sm">Transcript</div>
            </div>

            {/* Full list of transcripts - No scrollbar */}
            <div>
              {mockTranscriptionData.map((segment, index) => (
                <div
                  key={index}
                  ref={(el: HTMLDivElement | null) => {
                    segmentRefs.current[index] = el
                  }}
                  onClick={() => handleSegmentClick(segment.start)}
                  className={`grid grid-cols-12 gap-2 border-b border-gray-100 px-4 py-3 transition cursor-pointer ${
                    index === activeIndex ? "bg-yellow-50 border-l-4 border-l-yellow-400" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="col-span-3 font-mono text-gray-600 text-xs sm:text-sm font-semibold">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </div>
                  <div className={`col-span-9 text-gray-800 ${isMobile ? "text-xs" : "text-sm sm:text-base"}`}>
                    {segment.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Audio Player that adjusts based on header/footer visibility */}
        <div className={`${isMobile ? "hidden" : ""}`}>
          <DynamicAudioPlayer
            ref={audioRef}
            audioUrl="/audio/sample.mp3"
            //audioUrl={`/audio/sample.mp3?v=${Date.now()}`}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            isMobile={false}
          />
        </div>

        {/* Mobile Audio Player - Bottom fixed position */}
        {isMobile && (
          <div className="fixed bottom-16 right-0 z-50">
            <DynamicAudioPlayer
              ref={audioRef}
              audioUrl="/audio/sample.mp3"
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              isMobile={true}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
