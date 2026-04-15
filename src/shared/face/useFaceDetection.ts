import { ref } from 'vue'
import * as faceapi from 'face-api.js'

const MODELS_PATH = '/models'
const detectorOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.35,
})

const DETECT_MAX_SIDE = 360

export function useFaceDetection() {
  const isLoaded = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)
  let detectCanvas: HTMLCanvasElement | null = null
  let detectInFlight = false

  const loadModels = async () => {
    if (isLoaded.value) return
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_PATH),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
    ])
    isLoaded.value = true
  }

  const setupCamera = async () => {
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
