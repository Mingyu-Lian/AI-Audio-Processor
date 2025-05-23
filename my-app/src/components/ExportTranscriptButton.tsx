"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Save } from "lucide-react"
import jsPDF from "jspdf"

interface Segment {
  start: number
  end: number
  text: string
}

interface Group {
  groupStart: number
  groupEnd: number
  segments: Segment[]
}

interface Props {
  groupedData: Group[]
  favorites: Record<number, boolean>
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

export default function ExportTranscriptWithSelection({ groupedData, favorites }: Props) {
  const [selectedGroups, setSelectedGroups] = useState<number[]>(
    groupedData.map((_, idx) => idx)
  )
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  const toggleGroup = (idx: number) => {
    setSelectedGroups((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const handleExport = () => {
    const doc = new jsPDF()
    let y = 10
    const lineHeight = 7
    const margin = 10

    doc.setFontSize(12)
    doc.text("Transcript Export", margin, y)
    y += 10

    groupedData.forEach((group, groupIdx) => {
      if (!selectedGroups.includes(groupIdx)) return

      group.segments.forEach((seg, idx) => {
        const realIndex = groupedData
          .flatMap((g) => g.segments)
          .findIndex((s) => s.start === seg.start && s.end === seg.end)

        if (onlyFavorites && !favorites[realIndex]) return

        const timeRange = `${formatTime(seg.start)} - ${formatTime(seg.end)}`
        const header = `${idx + 1}. ${timeRange}`
        const wrapped = doc.splitTextToSize(seg.text, 180)

        if (y > 270) {
          doc.addPage()
          y = 10
        }

        doc.setFont("helvetica", "bold")
        doc.text(header, margin, y)
        y += lineHeight

        doc.setFont("helvetica", "normal")
        wrapped.forEach((line: string) => {
          if (y > 280) {
            doc.addPage()
            y = 10
          }
          doc.text(line, margin + 4, y)
          y += lineHeight
        })

        y += 4
      })
    })

    const url = doc.output("bloburl")
    window.open(url, "_blank")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="min-w-[140px] px-4 flex items-center justify-center">
          <Save className="mr-2 h-4 w-4" /> Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Groups to Export</DialogTitle>
        </DialogHeader>

        <div className="pt-2 px-1 flex items-center gap-2">
          <Checkbox
            checked={onlyFavorites}
            onCheckedChange={() => setOnlyFavorites(!onlyFavorites)}
          />
          <span className="text-sm">Only export favorited segments</span>
        </div>

        <div className="flex justify-end gap-2 px-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGroups(groupedData.map((_, idx) => idx))}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGroups([])}
          >
            Cancel All
          </Button>
        </div>

        <div className="space-y-2 px-1 pt-2">
          {groupedData.map((group, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <Checkbox
                checked={selectedGroups.includes(idx)}
                onCheckedChange={() => toggleGroup(idx)}
              />
              <span className="text-sm">
                {formatTime(group.groupStart)} - {formatTime(group.groupEnd)}
              </span>
            </label>
          ))}
        </div>

        <div className="pt-4 text-center">
          <Button onClick={handleExport} className="w-full">
            Preview & Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}