import { ref } from 'vue'

const MODELS_PATH = '/models'
const DETECT_MAX_SIDE = 360
type FaceApi = typeof import('face-api.js')
type FaceDetectionResult = {
  detection: {
    score: number
  }
  descriptor: Float32Array
} | null

interface E2EFaceDetectionDriver {
  loadModels?: () => Promise<void> | void
  setupCamera?: (video: HTMLVideoElement | null) => Promise<unknown> | unknown
  detectFace?: () => Promise<FaceDetectionResult> | FaceDetectionResult
  stopCamera?: () => void
}

declare global {
  interface Window {
    __ATTENDANCE_E2E_FACE__?: E2EFaceDetectionDriver
  }
}

let faceapiModule: FaceApi | null = null

async function loadFaceApi() {
  if (!faceapiModule) {
    faceapiModule = await import('face-api.js')
  }
  return faceapiModule
}

function getE2EDriver() {
  if (typeof window === 'undefined') return undefined
  return window.__ATTENDANCE_E2E_FACE__
}

export function useFaceDetection() {
  const isLoaded = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)
  let detectCanvas: HTMLCanvasElement | null = null
  let detectInFlight = false

  const loadModels = async () => {
    if (isLoaded.value) return

    const e2eDriver = getE2EDriver()
    if (e2eDriver) {
      await e2eDriver.loadModels?.()
      isLoaded.value = true
      return
    }

    const faceapi = await loadFaceApi()
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
    ])
    isLoaded.value = true
  }

  const setupCamera = async () => {
    const e2eDriver = getE2EDriver()
    if (e2eDriver) {
      return await e2eDriver.setupCamera?.(videoRef.value)
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640, max: 640 },
        height: { ideal: 480, max: 480 },
      },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
    return stream
  }

  const detectFace = async () => {
    const e2eDriver = getE2EDriver()
    if (e2eDriver?.detectFace) {
      return await e2eDriver.detectFace()
    }

    const video = videoRef.value
    if (!video || !isLoaded.value || video.readyState !== 4 || detectInFlight) return null

    const vw = video.videoWidth
    const vh = video.videoHeight
    if (!vw || !vh) return null

    const scale = Math.min(1, DETECT_MAX_SIDE / Math.max(vw, vh))
    const cw = Math.round(vw * scale)
    const ch = Math.round(vh * scale)

    if (!detectCanvas) detectCanvas = document.createElement('canvas')
    detectCanvas.width = cw
    detectCanvas.height = ch
    const ctx = detectCanvas.getContext('2d')
    if (!ctx) return null

    detectInFlight = true
    try {
      const faceapi = await loadFaceApi()
      const detectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.35,
      })
      ctx.drawImage(video, 0, 0, cw, ch)
      return await faceapi
        .detectSingleFace(detectCanvas, detectorOptions)
        .withFaceLandmarks(true)
        .withFaceDescriptor()
    } finally {
      detectInFlight = false
    }
  }

  const stopCamera = () => {
    const e2eDriver = getE2EDriver()
    if (e2eDriver) {
      e2eDriver.stopCamera?.()
      return
    }

    const stream = videoRef.value?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
  }

  return {
    videoRef,
    isLoaded,
    loadModels,
    setupCamera,
    detectFace,
    stopCamera,
  }
}
