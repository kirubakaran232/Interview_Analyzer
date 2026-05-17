import { useEffect, useRef, useCallback, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

/**
 * useMediaPipe — Attaches MediaPipe Face Mesh + Pose to a video element.
 * Returns real-time body language metrics per frame.
 */
export const useMediaPipe = (videoRef, onFrameResult) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const latestFaceResult = useRef(null);
  const latestPoseResult = useRef(null);

  const analyzeFace = useCallback((results) => {
    latestFaceResult.current = results;
  }, []);

  const analyzePose = useCallback((results) => {
    latestPoseResult.current = results;
  }, []);

  // Combine face + pose data into body language metrics
  const buildMetrics = useCallback(() => {
    const faceResults = latestFaceResult.current;
    const poseResults = latestPoseResult.current;
    const metrics = {
      eyeContact: 0,
      isLookingForward: false,
      postureScore: 0,
      shoulderLevel: 0,
      headTilt: 0,
      mouthOpenness: 0,
      expressionConfidence: 0,
    };

    // ── Face Analysis ──────────────────────────────────────
    if (faceResults?.multiFaceLandmarks?.length > 0) {
      const landmarks = faceResults.multiFaceLandmarks[0];

      // Eye contact: check if nose tip (landmark 1) is roughly centered
      const noseTip = landmarks[1];
      const centerX = 0.5;
      const centerY = 0.4;
      const distFromCenter = Math.sqrt(
        Math.pow(noseTip.x - centerX, 2) + Math.pow(noseTip.y - centerY, 2)
      );
      metrics.isLookingForward = distFromCenter < 0.15;
      metrics.eyeContact = metrics.isLookingForward ? 100 : Math.max(0, 100 - distFromCenter * 500);

      // Mouth openness (upper lip 13, lower lip 14)
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      metrics.mouthOpenness = Math.abs(upperLip.y - lowerLip.y) * 500;

      // Head tilt (left ear 234, right ear 454)
      const leftEar = landmarks[234];
      const rightEar = landmarks[454];
      metrics.headTilt = Math.abs(leftEar.y - rightEar.y) * 100;

      // Expression confidence: low head tilt + good eye contact = confident
      metrics.expressionConfidence = Math.min(100,
        metrics.eyeContact * 0.6 + (100 - metrics.headTilt * 2) * 0.4
      );
    }

    // ── Pose Analysis ──────────────────────────────────────
    if (poseResults?.poseLandmarks) {
      const landmarks = poseResults.poseLandmarks;
      // Left shoulder: 11, Right shoulder: 12
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];

      if (leftShoulder && rightShoulder) {
        // Shoulder levelness (0 = level, higher = tilted)
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        metrics.shoulderLevel = Math.max(0, 100 - shoulderDiff * 500);

        // Head (nose: 0) vs shoulder Y position
        const nose = landmarks[0];
        if (nose) {
          const headAboveShoulders = (leftShoulder.y + rightShoulder.y) / 2 - nose.y;
          // Good posture: head well above shoulders
          metrics.postureScore = Math.min(100, headAboveShoulders * 300);
        }
      }
    }

    return metrics;
  }, []);

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      // Initialize Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults(analyzeFace);
      faceMeshRef.current = faceMesh;

      // Initialize Pose
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(analyzePose);
      poseRef.current = pose;

      // Camera loop
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
          await pose.send({ image: videoRef.current });
          const metrics = buildMetrics();
          onFrameResult?.(metrics);
        },
        width: 640,
        height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      setIsLoaded(true);
    } catch (err) {
      console.error('MediaPipe error:', err);
      setError(err.message);
    }
  }, [videoRef, analyzeFace, analyzePose, buildMetrics, onFrameResult]);

  const stop = useCallback(() => {
    cameraRef.current?.stop();
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    return () => {
      cameraRef.current?.stop();
    };
  }, []);

  return { start, stop, isLoaded, error };
};
