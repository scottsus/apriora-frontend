"use client";

import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const LOUDNESS_THRESHOLD = 50;
const SILENCE_THRESHOLD = 20;
const SILENCE_DURATION = 2000;

export function useAudioAnalyzer({
  webcamRef,
  isStreamReady,
  isCapturing,
  onResponseStart,
  onResponseStop,
}: {
  webcamRef: React.RefObject<Webcam>;
  isStreamReady: boolean;
  isCapturing: boolean;
  onResponseStart: () => void;
  onResponseStop: () => void;
}) {
  const animationFrameRef = useRef<number | null>(null);

  const setupAudioAnalyzer = useCallback(() => {
    if (!webcamRef.current?.stream) return;

    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(
      webcamRef.current.stream,
    );
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let silenceTimer: NodeJS.Timeout | null = null;
    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

      if (isCapturing) {
        if (average <= SILENCE_THRESHOLD) {
          if (!silenceTimer) {
            silenceTimer = setTimeout(onResponseStop, SILENCE_DURATION);
          }
        } else {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
        }
      } else {
        if (average > LOUDNESS_THRESHOLD) {
          onResponseStart();
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [webcamRef, isCapturing, onResponseStart, onResponseStop]);

  useEffect(() => {
    if (isStreamReady) {
      const cleanup = setupAudioAnalyzer();
      return cleanup;
    }
  }, [isStreamReady, setupAudioAnalyzer]);
}
