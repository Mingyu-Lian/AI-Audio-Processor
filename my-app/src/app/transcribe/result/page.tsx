"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
// 老的bar import DynamicAudioPlayer from "@/components/AudioPlayer"
//新的bar
import DynamicAudioPlayer from "@/components/VerticalAudioPlayerV2"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight,  ArrowUp, Star } from "lucide-react"
import TranscriptSearchBox from "@/components/TranscriptSearchBox"
import ExportTranscriptButton from "@/components/ExportTranscriptButton"
import GroupProgressBar from "@/components/GroupProgressBar"
import { toast } from "sonner"
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
  if (audioDuration > 6 * 3600) return 3600        // > 6 小时 → 每组 1 小时
  if (audioDuration > 3 * 3600) return 1800        // > 3 小时 → 每组 30 分钟
  if (audioDuration > 3600) return 600             // > 1 小时 → 每组 10 分钟
  if (audioDuration > 1800) return 300             // > 30 分钟 → 每组 5 分钟
  if (audioDuration > 900) return 180              // > 15 分钟 → 每组 3 分钟 
  if (audioDuration > 300) return 120              // > 5 分钟 → 每组 2 分钟 
  return 0                                         // ≤ 5 分钟 → 不分组 
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

function findGroupIndexForSegment(segmentIndex: number, groups: Group[]): number {
  const segment = TRANSCRIPT_DATA[segmentIndex]
  return groups.findIndex(
    (group) => segment.start >= group.groupStart && segment.end <= group.groupEnd
  )
}

export default function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([])
  const groupRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const userInteractionRef = useRef(false)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const audioDuration = TRANSCRIPT_DATA[TRANSCRIPT_DATA.length - 1]?.end ?? 0
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({})
  const [allExpanded, setAllExpanded] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false) 
  const [highlightTerm, setHighlightTerm] = useState("")
  const [highlightIndexes, setHighlightIndexes] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [isFloating, setIsFloating] = useState(false)
  const [isFooterVisible, setIsFooterVisible] = useState(false)
  const [favorites, setFavorites] = useState<Record<number, boolean>>({})

  const handleSearchResultUpdate = (term: string, indexes: number[]) => {
    setHighlightTerm(term)
    setHighlightIndexes(indexes)
  }

  useEffect(() => {
    segmentRefs.current = new Array(TRANSCRIPT_DATA.length).fill(null)
  }, [TRANSCRIPT_DATA])
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
    const index = TRANSCRIPT_DATA.findIndex(
      (seg) => currentTime >= seg.start && currentTime < seg.end
    )
  
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index)
  
      if (!isUserScrolling && !userInteractionRef.current && autoScrollEnabled) {
        const groups = groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)
        const currentGroupIndex = findGroupIndexForSegment(index, groups)
  
        // Step 1: Expand the new group, collapse others
        setOpenGroups((prev) => {
          const updated: Record<number, boolean> = {}
          groups.forEach((_, i) => {
            updated[i] = i === currentGroupIndex
          })
          return updated
        })
  
        // Step 2: Wait for group to expand, then scroll to the actual active segment
        const scrollToSegment = () => {
          const el = segmentRefs.current[index]
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
          } else {
            setTimeout(scrollToSegment, 100)
          }
        }
  
        // Wait for re-render to complete (e.g., after group is opened)
        setTimeout(scrollToSegment, 400)
      }
    }
  
    userInteractionRef.current = false
  }, [currentTime, activeIndex, isUserScrolling, autoScrollEnabled])
  
  // Handle audio player events
  useEffect(() => {
    if (autoScrollEnabled) {
      const groups = groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)
      const firstGroupIndex = 0
      const initialOpen: Record<number, boolean> = {}
      groups.forEach((_, i) => {
        initialOpen[i] = i === firstGroupIndex
      })
      setOpenGroups(initialOpen)
    }
  }, [audioDuration, autoScrollEnabled])

  // Highlight search term in transcript
  function highlightText(text: string, keyword: string): React.ReactNode {
    if (!keyword) return text
    const parts = text.split(new RegExp(`(${keyword})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      )
    )
  }
  // Handle keyboard navigation for search results
  useEffect(() => {
    const handleScroll = () => {
      setIsFloating(window.scrollY > 160)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

 // Handle keyboard navigation for search results
  const goToMatch = (direction: "next" | "prev") => {
    if (highlightIndexes.length === 0) return
    let newIndex = currentMatchIndex + (direction === "next" ? 1 : -1)
  
    // 环绕跳转
    if (newIndex < 0) newIndex = highlightIndexes.length - 1
    if (newIndex >= highlightIndexes.length) newIndex = 0
  
    const realIdx = highlightIndexes[newIndex]
    const groups = groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)
    const groupIdx = findGroupIndexForSegment(realIdx, groups)
  
    setOpenGroups({ [groupIdx]: true })        // 只展开当前组
    setCurrentMatchIndex(newIndex)             // 更新当前索引
  
    const el = segmentRefs.current[realIdx]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }
  
  // Handle favorite toggle
  const toggleFavorite = (index: number) => {
  setFavorites((prev) => ({
    ...prev,
    [index]: !prev[index],
  }))
}
  // Handle segment click to jump to that point in audio
  const handleSegmentClick = (start: number) => {
    userInteractionRef.current = true
    setCurrentTime(start)

    if (audioRef.current) {
      audioRef.current.currentTime = start
      audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
    }
  }
  const handleToggleAll = () => {
    const newState = !allExpanded
    setAllExpanded(newState)
    const updated: Record<number, boolean> = {}
    groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration).forEach((_, i) => {
      updated[i] = newState
    })
    setOpenGroups(updated)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle footer visibility
  // This is a workaround to detect if the footer is visible
  useEffect(() => {
  const footerEl = document.querySelector("footer")

  const observer = new IntersectionObserver(
    ([entry]) => {
      setIsFooterVisible(entry.isIntersecting)
    },
    { threshold: 0.1 }
  )

  if (footerEl) observer.observe(footerEl)

  return () => {
    if (footerEl) observer.unobserve(footerEl)
  }
}, [])
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

        {/* Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          <Button
            variant={autoScrollEnabled ? "default" : "outline"}
            onClick={() => setAutoScrollEnabled((prev) => !prev)}
            className="min-w-[140px]"
          >
            {autoScrollEnabled ? "Auto-Scroll: ON" : "Auto-Scroll: OFF"}
          </Button>

          <Button
            variant={allExpanded ? "default" : "outline"}
            onClick={handleToggleAll}
            className="min-w-[140px]"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>

          <ExportTranscriptButton groupedData={groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)} />

  </div>
        <div className="mb-6 text-center space-x-2">
          {/* 自定义的搜索框组件 */}
          <TranscriptSearchBox
              transcriptData={TRANSCRIPT_DATA}
              segmentRefs={segmentRefs}
              audioDuration={audioDuration}
              groupTranscriptsByTime={groupTranscriptsByTime}
              findGroupIndexForSegment={findGroupIndexForSegment}
              setOpenGroups={setOpenGroups}
              onSearchResultUpdate={handleSearchResultUpdate}
              currentMatchIndex={currentMatchIndex}
              totalMatches={highlightIndexes.length}
              hasSearched={hasSearched}
              goToMatch={goToMatch}
              isFloating={isFloating && hasSearched}
              setHasSearched={setHasSearched}
            />
        </div>

        {/* Main Content Area - Adjusted for the fixed audio player */}
        <div className={`max-w-5xl mx-auto ${isMobile ? "pr-8 sm:pr-20" : "pr-0 md:pr-16"}`}>
          {/* Transcript Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Header Row */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-2">
              <div className="col-span-3 font-medium text-gray-700 text-sm">Timestamp</div>
              <div className="col-span-9 font-medium text-gray-700 text-sm">Transcript</div>
            </div>

            {/* Transcript segments */}
            <div>
              {groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration).map((group, groupIndex) => (
                  <div key={groupIndex} 
                  ref={(el) => { groupRefs.current[groupIndex] = el }}
                  className="border-b">
                  
                  {/* Trigger bar */}
                  <button
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [groupIndex]: !prev[groupIndex],
                      }))
                    }
                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-sm">
                    <span>{formatTime(group.groupStart)} - {formatTime(group.groupEnd)}</span>
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform ${
                        openGroups[groupIndex] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Animated content */}
                  <div className={`collapsible-content-wrapper ${openGroups[groupIndex] ? "expanded" : ""}`}>
                
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
                          <div className="flex justify-between items-center group">
                            <span>
                              {highlightIndexes.includes(realIndex)
                                ? highlightText(segment.text, highlightTerm)
                                : segment.text}
                            </span>

                            {(favorites[realIndex] || true) && (
                              <button
                                className={`ml-2 transition-opacity ${
                                  favorites[realIndex] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(realIndex)
                                }}
                                aria-label="Toggle Favorite"
                              >
                                <Star
                                  size={16}
                                  color={favorites[realIndex] ? "#facc15" : "#ccc"}
                                  fill={favorites[realIndex] ? "#facc15" : "none"}
                                />
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    )
                  })}

                  </div>
                  </div>
              )
              )}
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
      {/* Floating Group Progress Bar */}
      {groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration).map((group, groupIndex) => {
        const isGroupOpen = openGroups[groupIndex]
        const isActiveGroup = currentTime >= group.groupStart && currentTime < group.groupEnd
        const isVisible = isGroupOpen && isActiveGroup && !isFooterVisible

        return (
          <GroupProgressBar
            key={groupIndex}
            currentTime={currentTime}
            start={group.groupStart}
            end={group.groupEnd}
            onSeek={(newTime) => {
              userInteractionRef.current = false
              setCurrentTime(newTime)
              if (audioRef.current) {
                audioRef.current.currentTime = newTime
              }
            }}
            isVisible={isVisible}
            goToNextGroupStart={() => {
              const groups = groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)
              const nextGroup = groups[groupIndex + 1]
              if (!nextGroup) {
                toast("You are already at the last section.")
                return
              }

              const firstSeg = nextGroup.segments[0]
              userInteractionRef.current = false
              setCurrentTime(firstSeg.start)
              if (audioRef.current) {
                audioRef.current.currentTime = firstSeg.start
                audioRef.current.play().catch(console.error)
              }
              setOpenGroups(() => {
                const updated: Record<number, boolean> = {}
                groups.forEach((_, i) => {
                  updated[i] = i === groupIndex + 1
                })
                return updated
              })

              const scrollToFirstLine = () => {
                const realIndex = TRANSCRIPT_DATA.findIndex(
                  (s) => s.start === firstSeg.start && s.end === firstSeg.end
                )
                const el = segmentRefs.current[realIndex]
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" })
                } else {
                  setTimeout(scrollToFirstLine, 100)
                }
              }
              setTimeout(scrollToFirstLine, 400)
            }}
            goToPrevGroupStart={() => {
              const groups = groupTranscriptsByTime(TRANSCRIPT_DATA, audioDuration)
              const prevGroup = groups[groupIndex - 1]
              if (!prevGroup) {
                toast("You are already at the first section.")
                return
              }

              const firstSeg = prevGroup.segments[0]
              userInteractionRef.current = false
              setCurrentTime(firstSeg.start)
              if (audioRef.current) {
                audioRef.current.currentTime = firstSeg.start
                audioRef.current.play().catch(console.error)
              }
              setOpenGroups(() => {
                const updated: Record<number, boolean> = {}
                groups.forEach((_, i) => {
                  updated[i] = i === groupIndex - 1
                })
                return updated
              })

              const scrollToFirstLine = () => {
                const realIndex = TRANSCRIPT_DATA.findIndex(
                  (s) => s.start === firstSeg.start && s.end === firstSeg.end
                )
                const el = segmentRefs.current[realIndex]
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" })
                } else {
                  setTimeout(scrollToFirstLine, 100)
                }
              }
              setTimeout(scrollToFirstLine, 400)
            }}
          />

        )
      })}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            bottom: "85px",
            right: "50px",
            zIndex: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "9999px",
          }}
          aria-label="Scroll to Top"
        >
          <ArrowUp style={{ width: 20, height: 20 }} />
        </Button>

      )}


      <Footer />
    </div>
  )
}
