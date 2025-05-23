"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  currentTime: number
  start: number
  end: number
  onSeek: (newTime: number) => void
  isVisible: boolean
  goToNextGroupStart: () => void
  goToPrevGroupStart: () => void
}

export default function GroupProgressBar({
  currentTime,
  start,
  end,
  onSeek,
  isVisible,
  goToNextGroupStart,
  goToPrevGroupStart,
}: Props) {
  const duration = end - start
  const progress = Math.max(0, Math.min(currentTime - start, duration))

  return (
    <div
      className={`fixed bottom-0 left-0 w-full z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-95 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full px-4 sm:px-3 lg:px-6 max-w-screen-xl mx-auto bg-white/70 backdrop-blur border-t border-yellow-200 shadow-md rounded-t-lg py-4 flex items-center gap-4">
        {/* Prev Section */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevGroupStart}
          className="rounded-full border-gray-300 hover:bg-gray-100"
          aria-label="Previous Section"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Range + time */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={progress}
            onChange={(e) => {
              const local = Number(e.target.value)
              onSeek(start + local)
            }}
            className="w-full accent-yellow-500"
          />
          <div className="text-xs text-right text-gray-600 px-1">
            {formatTime(progress)} / {formatTime(duration)}
          </div>
        </div>

        {/* Next Section */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextGroupStart}
          className="rounded-full border-gray-300 hover:bg-gray-100"
          aria-label="Next Section"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const hoursStr = hrs > 0 ? `${hrs.toString().padStart(2, "0")}:` : ""
  const minsStr = mins.toString().padStart(2, "0")
  const secsStr = secs.toString().padStart(2, "0")
  return `${hoursStr}${minsStr}:${secsStr}`
}
