"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, X } from "lucide-react"

type Props = {
  transcriptData: { start: number; end: number; text: string }[]
  segmentRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  audioDuration: number
  groupTranscriptsByTime: (data: any[], duration: number) => any[]
  findGroupIndexForSegment: (idx: number, groups: any[]) => number
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  onSearchResultUpdate: (term: string, resultIndexes: number[]) => void
  currentMatchIndex: number
  totalMatches: number
  hasSearched: boolean
  isFloating: boolean
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>
  goToMatch: (dir: "next" | "prev") => void
}

export default function TranscriptSearchBox({
  transcriptData,
  segmentRefs,
  audioDuration,
  groupTranscriptsByTime,
  findGroupIndexForSegment,
  setOpenGroups,
  onSearchResultUpdate,
  currentMatchIndex,
  totalMatches,
  hasSearched,
  isFloating,
  setHasSearched,
  goToMatch,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    setHasSearched(true)
    setIsVisible(true)

    const lower = searchTerm.toLowerCase()
    const matchedIndexes = transcriptData
      .map((s, i) => ({ index: i, text: s.text.toLowerCase() }))
      .filter((s) => s.text.includes(lower))
      .map((s) => s.index)

    onSearchResultUpdate(searchTerm, matchedIndexes)

    const groups = groupTranscriptsByTime(transcriptData, audioDuration)
    const updated: Record<number, boolean> = {}
    matchedIndexes.forEach((idx) => {
      const groupIdx = findGroupIndexForSegment(idx, groups)
      updated[groupIdx] = true
    })
    setOpenGroups((prev) => ({ ...prev, ...updated }))

    if (matchedIndexes.length > 0) {
      const el = segmentRefs.current[matchedIndexes[0]]
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 400)
      }
    }
  }

  const handleClear = () => {
    setIsVisible(false) // 淡出动画
    setTimeout(() => {
      setSearchTerm("")
      onSearchResultUpdate("", [])
      setHasSearched(false)
      setIsVisible(true) // 重置为可见，便于后续操作
    }, 300)
  }

  return (
    <div
      className={`
        ${isFloating ? "fixed top-4 left-1/2 -translate-x-1/2 z-50" : "relative mx-auto mt-4"}
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        transition-all duration-300 ease-in-out
        bg-white/80 backdrop-blur-md rounded-lg shadow-md px-3 py-2 space-y-1 w-[280px] border border-gray-300
      `}
    >
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search..."
          className="h-8 px-2 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch()
          }}
        />
        <Button
          onClick={handleSearch}
          variant="default"
          size="sm"
          className="h-8 px-4"
        >
          Go
        </Button>
        {searchTerm && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {totalMatches > 0 ? (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
          <Button variant="ghost" size="icon" onClick={() => goToMatch("prev")}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center">
            {currentMatchIndex + 1} / {totalMatches}
          </span>
          <Button variant="ghost" size="icon" onClick={() => goToMatch("next")}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      ) : hasSearched ? (
        <div className="text-xs text-center text-gray-500 mt-1">No result</div>
      ) : null}

      
    </div>
  )
}
