"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import DynamicAudioPlayer from "@/components/AudioPlayer"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"

// TEST DATA
import { mockTranscriptionData } from "../mockTranscriptionData"
import { mockLongTranscriptionData } from "../mockLongTranscriptionData"

// === CONFIG AREA: easy to change when testing ===
const AUDIO_URL = "/audio/one_and_half_hour.mp3"

// const TRANSCRIPT_DATA = mockTranscriptionData
const TRANSCRIPT_DATA = mockLongTranscriptionData


function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const hoursStr = hrs > 0 ? `${hrs.toString().padStart(2, "0")}:` : ""
  const minsStr = mins.toString().padStart(2, "0")
  const secsStr = secs.toString().padStart(2, "0")

  return `${hoursStr}${minsStr}:${secsStr}`
}

type Segment = {
  start: number
  end: number
  text: string
}

type Group = {
  groupStart: number
  groupEnd: number
  segments: Segment[]
}

function getGroupDuration(audioDuration: number): number {
  if (audioDuration > 6 * 3600) return 3600  // 每小时
  if (audioDuration > 3 * 3600) return 1800  // 每30分钟
  if (audioDuration > 3600) return 600       // 每10分钟
  if (audioDuration > 1800) return 300       // 每5分钟
  return 0  // 不分组
}

function groupTranscriptsByTime(
  transcripts: Segment[],
  totalDuration: number
): Group[] {
  const groupDuration = getGroupDuration(totalDuration)
  if (groupDuration === 0) {
    return [{
      groupStart: transcripts[0]?.start ?? 0,
      groupEnd: transcripts[transcripts.length - 1]?.end ?? 0,
      segments: transcripts
    }]
  }
  const groups: Group[] = []
  let currentGroup: Group | null = null

  for (const seg of transcripts) {
    if (!currentGroup || seg.start >= currentGroup.groupEnd) {
      const groupStart = Math.floor(seg.start / groupDuration) * groupDuration
      const groupEnd = groupStart + groupDuration
      currentGroup = {
        groupStart,
        groupEnd,
        segments: []
      }
      groups.push(currentGroup)
    }
    currentGroup.segments.push(seg)
  }

  return groups
}

export default function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const userInteractionRef = useRef(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

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

  // Track user scrolling
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

  // Update active segment based on current time
  useEffect(() => {
    const index = TRANSCRIPT_DATA.findIndex((seg) => currentTime >= seg.start && currentTime < seg.end)
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index)

      if (!isUserScrolling && !userInteractionRef.current && autoScrollEnabled) {
        const el = segmentRefs.current[index]
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }

    // Reset user interaction flag after processing
    userInteractionRef.current = false
  }, [currentTime, activeIndex, isUserScrolling])

  // Handle segment click to jump to that point in audio
  const handleSegmentClick = (start: number) => {
    userInteractionRef.current = true
    setCurrentTime(start)

    if (audioRef.current) {
      audioRef.current.currentTime = start
      audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
    }
  }

  // Handle time updates from the audio player
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
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
        
        {/* Auto-Scroll Toggle Button */}
        <div className="mb-6 text-center">
          <Button
            variant={autoScrollEnabled ? "default" : "outline"}
            onClick={() => setAutoScrollEnabled((prev) => !prev)}
          >
            {autoScrollEnabled ? "Auto-Scroll: ON" : "Auto-Scroll: OFF"}
          </Button>
        </div>

        {/* Main Content Area - Adjusted for the fixed audio player */}
        <div className={`max-w-5xl mx-auto ${isMobile ? "pr-4 sm:pr-16" : "pr-0 md:pr-16"}`}>
          {/* Transcript Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Header Row */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-2">
              <div className="col-span-3 font-medium text-gray-700 text-sm">Timestamp</div>
              <div className="col-span-9 font-medium text-gray-700 text-sm">Transcript</div>
            </div>

            {/* Transcript segments */}
            <div>
              {groupTranscriptsByTime(TRANSCRIPT_DATA, 5400).map((group, groupIndex) => (
                <Collapsible key={groupIndex} defaultOpen>
                  <CollapsibleTrigger className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-sm border-b">
                    <span>{formatTime(group.groupStart)} - {formatTime(group.groupEnd)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {group.segments.map((segment: Segment, index) => {
                      const realIndex = TRANSCRIPT_DATA.findIndex(
                        (s) => s.start === segment.start && s.end === segment.end
                      )

                      return (
                        <div
                          key={index}
                          ref={(el: HTMLDivElement | null) => {
                            segmentRefs.current[realIndex] = el
                          }}
                          onClick={() => handleSegmentClick(segment.start)}
                          className={`grid grid-cols-12 gap-2 border-b border-gray-100 px-4 py-3 transition cursor-pointer ${
                            realIndex === activeIndex ? "bg-yellow-50 border-l-4 border-l-yellow-400" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="col-span-3 font-mono text-gray-600 text-xs sm:text-sm font-semibold">
                            {formatTime(segment.start)} - {formatTime(segment.end)}
                          </div>
                          <div className={`col-span-9 text-gray-800 ${isMobile ? "text-xs" : "text-sm sm:text-base"}`}>
                            {segment.text}
                          </div>
                        </div>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Audio Player */}
        <DynamicAudioPlayer
          ref={audioRef}
          audioUrl={AUDIO_URL}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          isMobile={isMobile}
        />
      </main>

      <Footer />
    </div>
  )
}
