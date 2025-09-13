"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface AntiCheatEvent {
  type:
    | "tab_switch"
    | "window_blur"
    | "copy_paste"
    | "right_click"
    | "keyboard_shortcut"
    | "fullscreen_exit"
    | "dev_tools"
  timestamp: Date
  details?: string
}

interface AntiCheatConfig {
  enableFullscreen: boolean
  blockCopyPaste: boolean
  blockRightClick: boolean
  blockKeyboardShortcuts: boolean
  detectTabSwitch: boolean
  detectWindowBlur: boolean
  detectDevTools: boolean
  maxViolations: number
  autoSubmitOnViolation: boolean
}

export function useAntiCheating(config: AntiCheatConfig, onViolation: (event: AntiCheatEvent) => void) {
  const [violations, setViolations] = useState<AntiCheatEvent[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const violationCountRef = useRef(0)

  const reportViolation = useCallback(
    (event: AntiCheatEvent) => {
      setViolations((prev) => [...prev, event])
      violationCountRef.current += 1
      onViolation(event)

      if (config.autoSubmitOnViolation && violationCountRef.current >= config.maxViolations) {
        // Auto-submit test
        window.dispatchEvent(new CustomEvent("force-submit-test"))
      }
    },
    [config.autoSubmitOnViolation, config.maxViolations, onViolation],
  )

  // Fullscreen management
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } catch (error) {
      console.error("Failed to enter fullscreen:", error)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      await document.exitFullscreen()
      setIsFullscreen(false)
    } catch (error) {
      console.error("Failed to exit fullscreen:", error)
    }
  }, [])

  useEffect(() => {
    if (!config.enableFullscreen) return

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen) {
        reportViolation({
          type: "fullscreen_exit",
          timestamp: new Date(),
          details: "User exited fullscreen mode",
        })
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [config.enableFullscreen, reportViolation])

  // Tab switching and window blur detection
  useEffect(() => {
    if (!config.detectTabSwitch && !config.detectWindowBlur) return

    const handleVisibilityChange = () => {
      if (document.hidden && config.detectTabSwitch) {
        reportViolation({
          type: "tab_switch",
          timestamp: new Date(),
          details: "User switched tabs or minimized window",
        })
      }
    }

    const handleWindowBlur = () => {
      setIsWindowFocused(false)
      if (config.detectWindowBlur) {
        reportViolation({
          type: "window_blur",
          timestamp: new Date(),
          details: "Window lost focus",
        })
      }
    }

    const handleWindowFocus = () => {
      setIsWindowFocused(true)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      window.removeEventListener("focus", handleWindowFocus)
    }
  }, [config.detectTabSwitch, config.detectWindowBlur, reportViolation])

  // Copy/paste prevention
  useEffect(() => {
    if (!config.blockCopyPaste) return

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      reportViolation({
        type: "copy_paste",
        timestamp: new Date(),
        details: `Attempted ${e.type} operation`,
      })
    }

    document.addEventListener("copy", handleCopyPaste)
    document.addEventListener("paste", handleCopyPaste)
    document.addEventListener("cut", handleCopyPaste)

    return () => {
      document.removeEventListener("copy", handleCopyPaste)
      document.removeEventListener("paste", handleCopyPaste)
      document.removeEventListener("cut", handleCopyPaste)
    }
  }, [config.blockCopyPaste, reportViolation])

  // Right-click prevention
  useEffect(() => {
    if (!config.blockRightClick) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      reportViolation({
        type: "right_click",
        timestamp: new Date(),
        details: "Right-click attempted",
      })
    }

    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)
  }, [config.blockRightClick, reportViolation])

  // Keyboard shortcut prevention
  useEffect(() => {
    if (!config.blockKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedCombinations = [
        { ctrl: true, key: "c" }, // Copy
        { ctrl: true, key: "v" }, // Paste
        { ctrl: true, key: "x" }, // Cut
        { ctrl: true, key: "a" }, // Select all
        { ctrl: true, key: "s" }, // Save
        { ctrl: true, key: "p" }, // Print
        { ctrl: true, key: "f" }, // Find
        { ctrl: true, key: "h" }, // History
        { ctrl: true, key: "j" }, // Downloads
        { ctrl: true, key: "k" }, // Search
        { ctrl: true, key: "l" }, // Address bar
        { ctrl: true, key: "n" }, // New window
        { ctrl: true, key: "t" }, // New tab
        { ctrl: true, key: "w" }, // Close tab
        { ctrl: true, key: "r" }, // Refresh
        { ctrl: true, shift: true, key: "i" }, // Dev tools
        { ctrl: true, shift: true, key: "j" }, // Console
        { ctrl: true, shift: true, key: "c" }, // Inspect
        { key: "F12" }, // Dev tools
        { alt: true, key: "Tab" }, // Alt+Tab
        { key: "F5" }, // Refresh
      ]

      const isBlocked = blockedCombinations.some((combo) => {
        return (
          (!combo.ctrl || e.ctrlKey) &&
          (!combo.shift || e.shiftKey) &&
          (!combo.alt || e.altKey) &&
          e.key.toLowerCase() === combo.key.toLowerCase()
        )
      })

      if (isBlocked) {
        e.preventDefault()
        reportViolation({
          type: "keyboard_shortcut",
          timestamp: new Date(),
          details: `Blocked shortcut: ${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.altKey ? "Alt+" : ""}${e.key}`,
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [config.blockKeyboardShortcuts, reportViolation])

  // Developer tools detection
  useEffect(() => {
    if (!config.detectDevTools) return

    const devtools = { open: false, orientation: null }
    const threshold = 160

    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          reportViolation({
            type: "dev_tools",
            timestamp: new Date(),
            details: "Developer tools opened",
          })
        }
      } else {
        devtools.open = false
      }
    }

    const interval = setInterval(detectDevTools, 500)
    return () => clearInterval(interval)
  }, [config.detectDevTools, reportViolation])

  return {
    violations,
    violationCount: violationCountRef.current,
    isFullscreen,
    isWindowFocused,
    enterFullscreen,
    exitFullscreen,
  }
}
