"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface ProctoringConfig {
  enableWebcam: boolean
  enableAudio: boolean
  enableScreenRecording: boolean
  faceDetection: boolean
  eyeTracking: boolean
  recordingQuality: "low" | "medium" | "high"
}

interface ProctoringData {
  webcamStream: MediaStream | null
  audioStream: MediaStream | null
  screenStream: MediaStream | null
  isRecording: boolean
  faceDetected: boolean
  eyesOnScreen: boolean
  recordingBlob: Blob | null
}

export function useProctoring(config: ProctoringConfig, testId: string) {
  const [proctoringData, setProctoringData] = useState<ProctoringData>({
    webcamStream: null,
    audioStream: null,
    screenStream: null,
    isRecording: false,
    faceDetected: false,
    eyesOnScreen: true,
    recordingBlob: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Initialize webcam
  const initializeWebcam = useCallback(async () => {
    if (!config.enableWebcam) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
        },
        audio: config.enableAudio,
      })

      setProctoringData((prev) => ({
        ...prev,
        webcamStream: stream,
        audioStream: config.enableAudio ? stream : null,
      }))

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Failed to initialize webcam:", error)
    }
  }, [config.enableWebcam, config.enableAudio])

  // Initialize screen recording
  const initializeScreenRecording = useCallback(async () => {
    if (!config.enableScreenRecording) return

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 10 },
        },
        audio: true,
      })

      setProctoringData((prev) => ({
        ...prev,
        screenStream: stream,
      }))
    } catch (error) {
      console.error("Failed to initialize screen recording:", error)
    }
  }, [config.enableScreenRecording])

  // Start recording
  const startRecording = useCallback(() => {
    const streams: MediaStream[] = []

    if (proctoringData.webcamStream) streams.push(proctoringData.webcamStream)
    if (proctoringData.screenStream) streams.push(proctoringData.screenStream)

    if (streams.length === 0) return

    // Combine streams
    const combinedStream = new MediaStream()
    streams.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        combinedStream.addTrack(track)
      })
    })

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm;codecs=vp9",
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
      setProctoringData((prev) => ({
        ...prev,
        recordingBlob: blob,
        isRecording: false,
      }))

      // Upload recording to server
      uploadRecording(blob)
    }

    mediaRecorder.start(1000) // Record in 1-second chunks
    mediaRecorderRef.current = mediaRecorder

    setProctoringData((prev) => ({
      ...prev,
      isRecording: true,
    }))
  }, [proctoringData.webcamStream, proctoringData.screenStream])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && proctoringData.isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [proctoringData.isRecording])

  // Upload recording to server
  const uploadRecording = useCallback(
    async (blob: Blob) => {
      const formData = new FormData()
      formData.append("recording", blob, `test-${testId}-${Date.now()}.webm`)
      formData.append("testId", testId)

      try {
        await fetch("/api/test/upload-recording", {
          method: "POST",
          body: formData,
        })
      } catch (error) {
        console.error("Failed to upload recording:", error)
      }
    },
    [testId],
  )

  // Face detection (simplified - would use ML library in production)
  const detectFace = useCallback(() => {
    if (!config.faceDetection || !webcamVideoRef.current || !canvasRef.current) return

    const video = webcamVideoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0)

    // Simplified face detection - in production, use libraries like face-api.js
    // This is a placeholder that randomly detects faces for demo purposes
    const faceDetected = Math.random() > 0.3

    setProctoringData((prev) => ({
      ...prev,
      faceDetected,
    }))

    // Send face detection data to server
    if (!faceDetected) {
      fetch("/api/test/proctoring-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          alert: "no_face_detected",
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error)
    }
  }, [config.faceDetection, testId])

  // Eye tracking (simplified)
  const trackEyes = useCallback(() => {
    if (!config.eyeTracking) return

    // Simplified eye tracking - in production, use WebGazer.js or similar
    const eyesOnScreen = Math.random() > 0.2

    setProctoringData((prev) => ({
      ...prev,
      eyesOnScreen,
    }))

    if (!eyesOnScreen) {
      fetch("/api/test/proctoring-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          alert: "eyes_off_screen",
          timestamp: new Date().toISOString(),
        }),
      }).catch(console.error)
    }
  }, [config.eyeTracking, testId])

  // Initialize proctoring
  useEffect(() => {
    initializeWebcam()
    initializeScreenRecording()
  }, [initializeWebcam, initializeScreenRecording])

  // Start face detection and eye tracking intervals
  useEffect(() => {
    let faceDetectionInterval: NodeJS.Timeout
    let eyeTrackingInterval: NodeJS.Timeout

    if (config.faceDetection) {
      faceDetectionInterval = setInterval(detectFace, 2000)
    }

    if (config.eyeTracking) {
      eyeTrackingInterval = setInterval(trackEyes, 1000)
    }

    return () => {
      if (faceDetectionInterval) clearInterval(faceDetectionInterval)
      if (eyeTrackingInterval) clearInterval(eyeTrackingInterval)
    }
  }, [config.faceDetection, config.eyeTracking, detectFace, trackEyes])

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (proctoringData.webcamStream) {
        proctoringData.webcamStream.getTracks().forEach((track) => track.stop())
      }
      if (proctoringData.screenStream) {
        proctoringData.screenStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [proctoringData.webcamStream, proctoringData.screenStream])

  return {
    ...proctoringData,
    webcamVideoRef,
    canvasRef,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenRecording,
  }
}
