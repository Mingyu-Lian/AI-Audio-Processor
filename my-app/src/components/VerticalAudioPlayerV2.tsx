"use client"

import type React from "react"
import { useEffect, useImperativeHandle, useRef, forwardRef, useState, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Props = {
  audioUrl: string
  currentTime: number
  onTimeUpdate: (time: number) => void
  isMobile?: boolean
}

const DynamicAudioPlayer = forwardRef<HTMLAudioElement, Props>(
  ({ audioUrl, currentTime, onTimeUpdate, isMobile = false }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const progressTrackRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<HTMLDivElement>(null)
    
    // Core audio state
    const [duration, setDuration] = useState(0)
    const [internalTime, setInternalTime] = useState(currentTime)
    const [isPlaying, setIsPlaying] = useState(false)
    
    // UI state
    const [volume, setVolume] = useState(1)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isVolumeOpen, setIsVolumeOpen] = useState(false)

    // Dynamic positioning states
    const [headerVisible, setHeaderVisible] = useState(true)
    const [footerVisible, setFooterVisible] = useState(false)
    const [topOffset, setTopOffset] = useState("80px") 
    const [bottomOffset, setBottomOffset] = useState("64px")

    const [isReady, setIsReady] = useState(false)
    // Expose internal audio element ref
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement)

    // Keep internal time in sync with external time
    useEffect(() => {
      if (!isDragging) {
        setInternalTime(currentTime)
      }
    }, [currentTime, isDragging])

    // Set up intersection observers for header and footer
    useEffect(() => {
      const headerElement = document.querySelector("header")
      const footerElement = document.querySelector("footer")

      if (!headerElement || !footerElement) return

      const headerObserver = new IntersectionObserver(
        ([entry]) => {
          setHeaderVisible(entry.isIntersecting)
          setTopOffset(entry.isIntersecting ? "80px" : "16px")
        },
        { threshold: 0.1 },
      )

      const footerObserver = new IntersectionObserver(
        ([entry]) => {
          setFooterVisible(entry.isIntersecting)
          setBottomOffset(entry.isIntersecting ? "64px" : "16px")
        },
        { threshold: 0.1 },
      )

      headerObserver.observe(headerElement)
      footerObserver.observe(footerElement)

      return () => {
        headerObserver.disconnect()
        footerObserver.disconnect()
      }
    }, [])

    // Sync external currentTime to audio element
    useEffect(() => {
      const audio = audioRef.current
      if (!audio || isDragging) return

      // Only seek if time difference is significant (from transcript click)
      if (Math.abs(audio.currentTime - currentTime) > 0.5) {
        audio.currentTime = currentTime

        // If we're seeking and audio is already playing, ensure it continues playing
        if (!audio.paused) {
          audio.play().catch((error) => console.error("Error playing audio:", error))
        }
      }
    }, [currentTime, isDragging])

    // Update currentTime in parent
    const handleTimeUpdate = useCallback(() => {
      const audio = audioRef.current
      if (!audio || isDragging) return
      
      const newTime = audio.currentTime
      setInternalTime(newTime)
      onTimeUpdate(newTime)
    }, [onTimeUpdate, isDragging])

    // Set up time update listener
    useEffect(() => {
      const audio = audioRef.current
      if (!audio) return
      
      audio.addEventListener("timeupdate", handleTimeUpdate)
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate)
      }
    }, [handleTimeUpdate])

    // Set duration when metadata loads
    // Set duration when metadata loads
    useEffect(() => {
      const audio = audioRef.current
      if (!audio) return

      const handleLoadedMetadata = () => {
        if (audio.duration > 0) {
          setDuration(audio.duration)
          setIsReady(true)
        }
      }

      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }, [])
    // 在播放时，确保 isReady 被设置（兜底处理）
    useEffect(() => {
      const audio = audioRef.current
      if (!audio) return

      if (audio.readyState >= 1 && audio.duration > 0) {
        setDuration(audio.duration)
        setIsReady(true)
      }
    }, [audioUrl])

    // Listen for play/pause events to update isPlaying state
    useEffect(() => {
      const audio = audioRef.current
      if (!audio) return

      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)
      const handleEnded = () => setIsPlaying(false)

      audio.addEventListener("play", handlePlay)
      audio.addEventListener("pause", handlePause)
      audio.addEventListener("ended", handleEnded)

      return () => {
        audio.removeEventListener("play", handlePlay)
        audio.removeEventListener("pause", handlePause)
        audio.removeEventListener("ended", handleEnded)
      }
    }, [])

    // Play/Pause toggle
    const togglePlay = () => {
      const audio = audioRef.current
      if (!audio) return
      
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      } else {
        audio.pause()
        setIsPlaying(false)
      }
    }

    // Progress slider handler - using direct time values (not inverted)
    const handleProgressChange = (value: number[]) => {
      const newTime = value[0]
      setInternalTime(newTime)
      
      if (audioRef.current) {
        audioRef.current.currentTime = newTime
        onTimeUpdate(newTime)
      }
    }

    // Handle direct track click
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressTrackRef.current || !duration) return

      const rect = progressTrackRef.current.getBoundingClientRect()
      const clickPosition = (e.clientY - rect.top) / rect.height
      const newTime = clickPosition * duration

      if (audioRef.current) {
        audioRef.current.currentTime = newTime
        setInternalTime(newTime)
        onTimeUpdate(newTime)
      }
    }

    // Volume slider handler
    const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0]
      setVolume(newVolume)
      
      if (audioRef.current) {
        audioRef.current.volume = newVolume
        setIsMuted(newVolume === 0)
      }
    }

    // Toggle mute
    const toggleMute = () => {
      if (audioRef.current) {
        if (isMuted) {
          audioRef.current.volume = volume || 1
          setIsMuted(false)
        } else {
          audioRef.current.volume = 0
          setIsMuted(true)
        }
      }
    }

    // Playback rate handler
    const handleRateChange = (rate: number) => {
      setPlaybackRate(rate)
      if (audioRef.current) {
        audioRef.current.playbackRate = rate
      }
    }

    // Format seconds to mm:ss
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0")
      const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0")
      return `${mins}:${secs}`
    }

    // Calculate progress percentage for custom track styling
    const progressPercentage = duration > 0 ? (internalTime / duration) * 100 : 0

    // Determine sizes based on mobile state
    const containerWidth = isMobile ? "w-10" : "w-12"
    const buttonSize = isMobile ? "h-6 w-6" : "h-8 w-8"
    const iconSize = isMobile ? "h-3 w-3" : "h-4 w-4"
    const speedButtonSize = isMobile ? "h-5 w-7" : "h-6 w-8"
    const speedTextSize = isMobile ? "text-[10px]" : "text-xs"
    const timeTextSize = isMobile ? "text-[8px]" : "text-[10px]"
    const trackWidth = isMobile ? "w-1.5" : "w-2"
    const handleSize = isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
    const handleOffset = isMobile ? "7px" : "8px"

    

    return (
      <div
        ref={playerRef}
        className={`fixed right-0 flex flex-col items-center py-4 px-1 bg-transparent ${containerWidth} z-50 transition-all duration-300`}
        style={{
          top: topOffset,
          bottom: bottomOffset,
        }}
      >
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onLoadedMetadata={() => {
            const audio = audioRef.current
            if (audio) {
              setDuration(audio.duration)
              setIsReady(true)
            }
          }}
          className="hidden"
        />

        {/* Time display - Current time at top */}
        {isReady && (
          <div className={`${timeTextSize} font-mono mb-2 text-center`}>
            {formatTime(internalTime)}
          </div>
        )}

        {/* Play/Pause button */}
        <Button
          onClick={togglePlay}
          size="icon"
          variant="ghost"
          className={`${buttonSize} rounded-full mb-2 bg-gray-200/80 hover:bg-gray-300/80`}
        >
          {isPlaying ? <Pause className={iconSize} /> : <Play className={`${iconSize} ml-0.5`} />}
        </Button>

        {/* Custom scrollbar-like progress track */}
        <div
          className="relative flex-grow w-full flex justify-center my-2"
          ref={progressTrackRef}
          onClick={handleTrackClick}
        >
          <div className={`relative ${trackWidth} bg-gray-200/80 rounded-full overflow-hidden h-full`}>
            {/* Progress indicator - moves from top to bottom */}
            <div
              className="absolute top-0 left-0 right-0 bg-gray-400 rounded-full"
              style={{ height: `${progressPercentage}%` }}
            ></div>

            {/* Progress handle/thumb - Round point */}
            <div
              className={`absolute left-1/2 ${handleSize} bg-gray-500 rounded-full -translate-x-1/2 transform transition-all ${isDragging ? "scale-110" : ""}`}
              style={{
                top: `${progressPercentage}%`,
                boxShadow: "0 0 0 2px #6b7280",
              }}
            ></div>

            {/* Interactive slider - now using direct time values */}
            {isReady && duration > 0 && (
              <Slider
                value={[internalTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => {
                  setInternalTime(value[0])
                }}
                onValueCommit={handleProgressChange}
                orientation="vertical"
                className="h-full absolute inset-0 opacity-0 cursor-pointer"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
              />
          )}
          </div>
        </div>

        {/* Volume control */}
        <Popover open={isVolumeOpen} onOpenChange={setIsVolumeOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className={`${buttonSize} rounded-full mb-2 bg-gray-200/80 hover:bg-gray-300/80`}
            >
              {isMuted || volume === 0 ? <VolumeX className={iconSize} /> : <Volume2 className={iconSize} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={`${isMobile ? "w-12" : "w-14"} p-3 flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg border border-gray-200`}
            side="left"
            align="center"
            sideOffset={5}
          >
            <div className="h-[120px] w-full flex justify-center items-center">
              {/* Custom volume slider */}
              <div className={`relative h-full ${trackWidth} bg-gray-200 rounded-full overflow-hidden`}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gray-400 rounded-full"
                  style={{ height: `${volume * 100}%` }}
                ></div>
                <div
                  className={`absolute left-1/2 ${handleSize} bg-gray-500 rounded-full -translate-x-1/2 transform`}
                  style={{
                    bottom: `calc(${volume * 100}% - ${handleOffset})`,
                    boxShadow: "0 0 0 2px #6b7280",
                  }}
                ></div>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  orientation="vertical"
                  className="h-full absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Playback Speed Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${speedTextSize} ${speedButtonSize} rounded-sm bg-gray-200/80 hover:bg-gray-300/80`}
            >
              {playbackRate}x
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-16">
            {[0.5, 1, 1.5, 2, 5, 10].map((rate) => (
              <DropdownMenuItem key={rate} onClick={() => handleRateChange(rate)} className="text-xs justify-center">
                {rate}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Duration display - Total duration at bottom */}
        <div className={`${timeTextSize} font-mono mt-2 text-center`}>{formatTime(duration)}</div>
      </div>
    )
  },
)

DynamicAudioPlayer.displayName = "DynamicAudioPlayer"

export default DynamicAudioPlayer
