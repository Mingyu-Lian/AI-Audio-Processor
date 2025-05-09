"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Props = {
  transcriptData: { start: number; end: number; text: string }[]
  segmentRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
  audioDuration: number
  groupTranscriptsByTime: (data: any[], duration: number) => any[]
  findGroupIndexForSegment: (idx: number, groups: any[]) => number
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  onSearchResultUpdate: (term: string, resultIndexes: number[]) => void  // 👈 通知父组件做高亮
}

export default function TranscriptSearchBox({
  transcriptData,
  segmentRefs,
  audioDuration,
  groupTranscriptsByTime,
  findGroupIndexForSegment,
  setOpenGroups,
  onSearchResultUpdate,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [resultCount, setResultCount] = useState<number | null>(null)

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    const lower = searchTerm.toLowerCase()
    const matchedIndexes = transcriptData
      .map((s, i) => ({ index: i, text: s.text.toLowerCase() }))
      .filter((s) => s.text.includes(lower))
      .map((s) => s.index)

    setResultCount(matchedIndexes.length)
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

  return (
    <div className="text-center space-y-2">
      <div className="space-x-2">
        <Input
          placeholder="Search transcript..."
          className="inline-block w-[220px] mr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch()
          }}
        />
        <Button onClick={handleSearch} variant="outline">Search</Button>
      </div>
      {resultCount !== null && (
        <div className="text-sm text-gray-600">
          {resultCount > 0
            ? `${resultCount} result${resultCount > 1 ? "s" : ""} found`
            : "No results found"}
        </div>
      )}
    </div>
  )
}
