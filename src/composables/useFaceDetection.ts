import { ref } from 'vue';
import * as faceapi from 'face-api.js';

const MODELS_PATH = '/models';
const detectorOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

export function useFaceDetection() {
  const isLoaded = ref(false);
  const videoRef = ref<HTMLVideoElement | null>(null);

  const loadModels = async () => {
    if (isLoaded.value) return;
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_PATH),
    ]);
    isLoaded.value = true;
  };

  const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
    return stream;
  };

  const detectFace = async () => {
    if (!videoRef.value || !isLoaded.value || videoRef.value.readyState !== 4) return null;
    
    return await faceapi
      .detectSingleFace(videoRef.value, detectorOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
  };

  const stopCamera = () => {
    const stream = videoRef.value?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(track => track.stop());
  };

  return {
    videoRef,
    isLoaded,
    loadModels,
    setupCamera,
    detectFace,
    stopCamera
  };
}
